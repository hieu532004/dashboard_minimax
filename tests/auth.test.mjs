import test from "node:test";
import assert from "node:assert/strict";

import { createSessionToken, verifySessionToken } from "../lib/auth.mjs";

const SECRET = "test-secret-that-is-long-enough-for-hmac-signing";

test("signed admin session round-trips before expiry", () => {
  const now = new Date("2026-08-03T00:00:00.000Z");
  const token = createSessionToken({ username: "admin", now, secret: SECRET });

  assert.deepEqual(
    verifySessionToken(token, { now: new Date("2026-08-03T01:00:00.000Z"), secret: SECRET }),
    { username: "admin" },
  );
});

test("tampered and expired admin sessions are rejected", () => {
  const now = new Date("2026-08-03T00:00:00.000Z");
  const token = createSessionToken({ username: "admin", now, secret: SECRET });

  assert.equal(verifySessionToken(`${token}x`, { now, secret: SECRET }), null);
  assert.equal(
    verifySessionToken(token, { now: new Date("2026-08-04T00:00:01.000Z"), secret: SECRET }),
    null,
  );
});
