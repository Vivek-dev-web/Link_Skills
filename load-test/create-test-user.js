/**
 * Creates the test user that the k6 script needs.
 * Run once before load testing:
 *   node load-test/create-test-user.js
 *
 * Targets production by default. Override with:
 *   BASE_URL=http://localhost:3001 node load-test/create-test-user.js
 */

const BASE_URL = (process.env.BASE_URL || "https://link-skills.vercel.app").replace(/\/$/, "");
const EMAIL    = process.env.TEST_EMAIL    || "loadtest@atlas.dev";
const PASSWORD = process.env.TEST_PASSWORD || "Test@123456";
const NAME     = process.env.TEST_NAME     || "Load Test User";

async function main() {
  console.log(`Creating test user at ${BASE_URL} …`);

  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: NAME, email: EMAIL, password: PASSWORD, role: "MEMBER" }),
  });

  const body = await res.json();

  if (res.status === 409) {
    console.log(`✓ User already exists (${EMAIL}) — ready to test.`);
    return;
  }

  if (!res.ok) {
    console.error("✗ Failed to create user:", body);
    process.exit(1);
  }

  console.log(`✓ Created: ${body.name} <${body.email}> (id: ${body.id})`);
  console.log(`\nNow run:\n  k6 run load-test/k6-script.js --env BASE_URL=${BASE_URL} --env TEST_EMAIL=${EMAIL} --env TEST_PASSWORD=${PASSWORD}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
