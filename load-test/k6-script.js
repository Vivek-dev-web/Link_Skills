/**
 * Atlas Load Test — k6
 *
 * Install k6:  https://k6.io/docs/get-started/installation/
 *   Windows:   choco install k6   OR   winget install k6
 *
 * Run (light):
 *   k6 run load-test/k6-script.js \
 *       --env BASE_URL=https://link-skills.vercel.app \
 *       --env TEST_EMAIL=loadtest@atlas.dev \
 *       --env TEST_PASSWORD=Test@123456
 *
 * Run (heavier):
 *   k6 run load-test/k6-script.js --env BASE_URL=... --env TEST_EMAIL=... \
 *       --env TEST_PASSWORD=... --env SCENARIO=medium
 *
 * Run (stress):
 *   ... --env SCENARIO=stress
 *
 * Create the test user first:
 *   node load-test/create-test-user.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

// ── Config ──────────────────────────────────────────────────────────────────

const BASE_URL  = (__ENV.BASE_URL || "https://link-skills.vercel.app").replace(/\/$/, "");
const PASSWORD  = __ENV.TEST_PASSWORD || "Test@123456";
const SCENARIO  = __ENV.SCENARIO || "light";
// Max numbered test accounts (loadtest1@atlas.dev … loadtestN@atlas.dev).
// Each VU gets its own account so sessions never conflict.
const MAX_USERS = parseInt(__ENV.MAX_USERS || "20", 10);

function emailForVU() {
  const slot = ((__VU - 1) % MAX_USERS) + 1;
  return `loadtest${slot}@atlas.dev`;
}

// ── Scenarios ────────────────────────────────────────────────────────────────

const STAGES = {
  light: [
    { duration: "20s", target: 5 },
    { duration: "1m",  target: 20 },
    { duration: "1m",  target: 20 },
    { duration: "20s", target: 0 },
  ],
  medium: [
    { duration: "30s", target: 10 },
    { duration: "2m",  target: 50 },
    { duration: "2m",  target: 50 },
    { duration: "30s", target: 0 },
  ],
  stress: [
    { duration: "30s", target: 10 },
    { duration: "1m",  target: 50 },
    { duration: "1m",  target: 100 },
    { duration: "2m",  target: 100 },
    { duration: "30s", target: 0 },
  ],
};

export const options = {
  scenarios: {
    users: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: STAGES[SCENARIO] || STAGES.light,
    },
  },
  thresholds: {
    // 95% of requests must complete under 3 s
    http_req_duration: ["p(95)<3000"],
    // Less than 5% of requests may fail
    http_req_failed: ["rate<0.05"],
    // Login must succeed at least 90% of the time
    login_success: ["rate>0.90"],
  },
};

// ── Custom metrics ────────────────────────────────────────────────────────────

const loginSuccess  = new Rate("login_success");
const feedLoadTime  = new Trend("feed_load_time_ms", true);
const apiErrors     = new Counter("api_errors");

// ── Helpers ───────────────────────────────────────────────────────────────────

// Per-VU session flag — k6 reuses VUs across iterations so we only log in once
let _loggedIn = false;

function login() {
  // Step 1 — fetch CSRF token (NextAuth requires it for credential POSTs)
  const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`, { tags: { name: "auth/csrf" } });
  if (!check(csrfRes, { "csrf 200": (r) => r.status === 200 })) {
    apiErrors.add(1);
    loginSuccess.add(false);
    return false;
  }

  let csrfToken;
  try {
    csrfToken = JSON.parse(csrfRes.body).csrfToken;
  } catch {
    loginSuccess.add(false);
    return false;
  }

  // Step 2 — POST credentials (k6 cookie jar carries the session cookie)
  const loginRes = http.post(
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      csrfToken,
      email: emailForVU(),
      password: PASSWORD,
      callbackUrl: BASE_URL,
      json: "true",
    },
    {
      redirects: 0,
      tags: { name: "auth/login" },
    }
  );

  // NextAuth returns 302 on success or 200 with a redirect URL; both are fine
  const ok = loginRes.status === 200 || loginRes.status === 302;
  loginSuccess.add(ok);
  if (!ok) apiErrors.add(1);
  return ok;
}

function parsePosts(res) {
  try {
    return JSON.parse(res.body).posts || [];
  } catch {
    return [];
  }
}

// ── Main VU loop ──────────────────────────────────────────────────────────────

export default function () {
  // Login once per VU lifetime
  if (!_loggedIn) {
    _loggedIn = login();
    if (!_loggedIn) {
      sleep(2);
      return;
    }
    sleep(1);
  }

  // ── 1. Load feed ─────────────────────────────────────────────────────────
  group("feed", () => {
    const t0 = Date.now();
    const res = http.get(`${BASE_URL}/api/posts?page=1`, { tags: { name: "posts/list" } });
    feedLoadTime.add(Date.now() - t0);

    check(res, { "feed 200": (r) => r.status === 200 });

    const posts = parsePosts(res);

    if (posts.length > 0) {
      // Pick a random post
      const post = posts[randomIntBetween(0, posts.length - 1)];

      sleep(randomIntBetween(1, 2));

      // ── 2. Like the post ────────────────────────────────────────────────
      group("like_post", () => {
        const likeRes = http.post(
          `${BASE_URL}/api/posts/${post.id}/like`,
          null,
          { tags: { name: "posts/like" } }
        );
        check(likeRes, { "like 200": (r) => r.status === 200 });
      });

      sleep(randomIntBetween(1, 2));

      // ── 3. Load comments ────────────────────────────────────────────────
      group("comments", () => {
        const commentsRes = http.get(
          `${BASE_URL}/api/posts/${post.id}/comments`,
          { tags: { name: "posts/comments" } }
        );
        check(commentsRes, { "comments 200": (r) => r.status === 200 });

        sleep(randomIntBetween(1, 2));

        // ── 4. Post a comment ─────────────────────────────────────────────
        const commentRes = http.post(
          `${BASE_URL}/api/posts/${post.id}/comments`,
          JSON.stringify({ content: "Interesting — thanks for sharing this!" }),
          {
            headers: { "Content-Type": "application/json" },
            tags: { name: "posts/comment" },
          }
        );
        check(commentRes, { "comment 200/201": (r) => r.status === 200 || r.status === 201 });
      });
    }

    sleep(randomIntBetween(1, 3));
  });

  // ── 5. Notifications ─────────────────────────────────────────────────────
  group("notifications", () => {
    const notifRes = http.get(`${BASE_URL}/api/notifications`, { tags: { name: "notifications" } });
    check(notifRes, { "notif 200": (r) => r.status === 200 });
  });

  sleep(randomIntBetween(1, 3));

  // ── 6. Profile page (view own profile via API) ────────────────────────────
  group("profile", () => {
    const meRes = http.get(`${BASE_URL}/api/users`, { tags: { name: "users/list" } });
    check(meRes, { "users 200": (r) => r.status === 200 });
  });

  sleep(randomIntBetween(2, 4));
}
