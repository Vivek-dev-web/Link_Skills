/**
 * Atlas Load Test — k6
 *
 * Install k6:  https://k6.io/docs/get-started/installation/
 *   Windows:   winget install k6
 *
 * Prerequisites — run once to create test accounts:
 *   node load-test/create-test-user.js
 *   (for numbered accounts 1-20, the PowerShell loop in the README)
 *
 * Run (light — default, 20 VUs ~3 min):
 *   k6 run load-test/k6-script.js --env BASE_URL=https://link-skills.vercel.app --env TEST_PASSWORD=Test@123456
 *
 * Run (heavier):
 *   k6 run load-test/k6-script.js --env BASE_URL=... --env TEST_PASSWORD=... --env SCENARIO=medium
 *
 * Run (stress):
 *   ... --env SCENARIO=stress
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL  = (__ENV.BASE_URL || "https://link-skills.vercel.app").replace(/\/$/, "");
const PASSWORD  = __ENV.TEST_PASSWORD || "Test@123456";
const SCENARIO  = __ENV.SCENARIO || "light";
const MAX_USERS = parseInt(__ENV.MAX_USERS || "20", 10);

// ── Scenarios ─────────────────────────────────────────────────────────────────

const STAGES = {
  light: [
    { duration: "20s", target: 5  },
    { duration: "1m",  target: 20 },
    { duration: "1m",  target: 20 },
    { duration: "20s", target: 0  },
  ],
  medium: [
    { duration: "30s", target: 10 },
    { duration: "2m",  target: 50 },
    { duration: "2m",  target: 50 },
    { duration: "30s", target: 0  },
  ],
  stress: [
    { duration: "30s", target: 10  },
    { duration: "1m",  target: 50  },
    { duration: "1m",  target: 100 },
    { duration: "2m",  target: 100 },
    { duration: "30s", target: 0   },
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
    http_req_duration: ["p(95)<3000"],
    http_req_failed:   ["rate<0.05"],
    login_success:     ["rate>0.90"],
  },
};

// ── Custom metrics ────────────────────────────────────────────────────────────

const loginSuccess = new Rate("login_success");
const feedLoadTime = new Trend("feed_load_time_ms", true);
const apiErrors    = new Counter("api_errors");

// ── Setup: log in all N users once, extract their session tokens ──────────────
// k6 setup() runs once before VUs start. We pre-authenticate every test account
// and pass the raw session-token cookie value to the VU functions, which inject
// it into their per-VU cookie jar on every iteration — bypassing the k6/NextAuth
// cookie-persistence issue where __Secure- prefixed cookies aren't always sent.

export function setup() {
  const sessions = [];

  for (let i = 1; i <= MAX_USERS; i++) {
    const email = `loadtest${i}@atlas.dev`;

    // 1. CSRF token
    const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`);
    if (csrfRes.status !== 200) {
      console.error(`[setup] CSRF failed for ${email} (${csrfRes.status})`);
      sessions.push({ email, token: null, cookieName: null });
      sleep(0.3);
      continue;
    }

    let csrfToken;
    try { csrfToken = JSON.parse(csrfRes.body).csrfToken; }
    catch { sessions.push({ email, token: null, cookieName: null }); continue; }

    // 2. Credentials POST — don't follow redirect, just capture Set-Cookie
    const loginRes = http.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      { csrfToken, email, password: PASSWORD, callbackUrl: BASE_URL, json: "true" },
      { redirects: 0 }
    );

    // Extract session-token cookie from the response (works regardless of __Secure- prefix)
    let token = null;
    let cookieName = null;
    for (const [name, vals] of Object.entries(loginRes.cookies || {})) {
      if (name.includes("session-token")) {
        cookieName = name;
        token = vals[0].value;
        break;
      }
    }

    if (token) {
      console.log(`[setup] ✓ ${email} → cookie: ${cookieName}`);
    } else {
      console.error(`[setup] ✗ ${email} — no session token (status ${loginRes.status})`);
    }

    sessions.push({ email, token, cookieName });
    sleep(0.3);
  }

  return { sessions };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePosts(res) {
  try { return JSON.parse(res.body).posts || []; }
  catch { return []; }
}

function injectSession(data) {
  const idx = (__VU - 1) % data.sessions.length;
  const { token, cookieName } = data.sessions[idx];
  if (!token) return false;
  // Inject into this VU's per-request jar so every request in this iteration
  // carries the correct session cookie, regardless of what k6 persisted.
  const jar = http.cookieJar();
  jar.set(`${BASE_URL}/`, cookieName, token);
  return true;
}

// ── Main VU loop ──────────────────────────────────────────────────────────────

export default function (data) {
  const authed = injectSession(data);
  loginSuccess.add(authed);
  if (!authed) {
    apiErrors.add(1);
    sleep(2);
    return;
  }

  // 1. Feed ──────────────────────────────────────────────────────────────────
  let posts = [];
  group("feed", () => {
    const t0 = Date.now();
    const res = http.get(`${BASE_URL}/api/posts?page=1`, { tags: { name: "posts/list" } });
    feedLoadTime.add(Date.now() - t0);
    check(res, { "feed 200": (r) => r.status === 200 });
    posts = parsePosts(res);
  });

  if (posts.length > 0) {
    const post = posts[randomIntBetween(0, posts.length - 1)];
    sleep(randomIntBetween(1, 2));

    // 2. Like ────────────────────────────────────────────────────────────────
    group("like_post", () => {
      const r = http.post(
        `${BASE_URL}/api/posts/${post.id}/like`,
        null,
        { tags: { name: "posts/like" } }
      );
      check(r, { "like 200": (r) => r.status === 200 });
      if (r.status !== 200) apiErrors.add(1);
    });

    sleep(randomIntBetween(1, 2));

    // 3. Comments ────────────────────────────────────────────────────────────
    group("comments", () => {
      const getRes = http.get(
        `${BASE_URL}/api/posts/${post.id}/comments`,
        { tags: { name: "posts/comments" } }
      );
      check(getRes, { "comments 200": (r) => r.status === 200 });

      sleep(randomIntBetween(1, 2));

      const postRes = http.post(
        `${BASE_URL}/api/posts/${post.id}/comments`,
        JSON.stringify({ content: "Great post — very insightful!" }),
        { headers: { "Content-Type": "application/json" }, tags: { name: "posts/comment" } }
      );
      check(postRes, { "comment 200": (r) => r.status === 200 });
      if (postRes.status !== 200) apiErrors.add(1);
    });
  }

  sleep(randomIntBetween(1, 2));

  // 4. Notifications ─────────────────────────────────────────────────────────
  group("notifications", () => {
    const r = http.get(`${BASE_URL}/api/notifications`, { tags: { name: "notifications" } });
    check(r, { "notif 200": (r) => r.status === 200 });
  });

  sleep(randomIntBetween(2, 4));
}
