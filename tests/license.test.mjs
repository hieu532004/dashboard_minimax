import test from "node:test";
import assert from "node:assert/strict";

import {
  evaluateLicenseRecord,
  normalizeLicenseKey,
  parseExpiryDate,
} from "../lib/license.mjs";


test("normalizes a CPU key without changing its groups", () => {
  assert.equal(
    normalizeLicenseKey("  ase-abcde-fghij-klmno-pqrst-uvwxy  "),
    "ASE-ABCDE-FGHIJ-KLMNO-PQRST-UVWXY",
  );
});


test("parses the dashboard dd/mm/yyyy expiry format strictly", () => {
  assert.deepEqual(parseExpiryDate("31/12/2027"), {
    year: 2027,
    month: 12,
    day: 31,
    iso: "2027-12-31",
  });
  assert.equal(parseExpiryDate("2027-12-31"), null);
  assert.equal(parseExpiryDate("31/02/2027"), null);
});


test("license remains active through its expiry date in Bangkok time", () => {
  const result = evaluateLicenseRecord(
    { key: "ASE-ABCDE-FGHIJ-KLMNO-PQRST-UVWXY", time: "03/08/2026", name: "A" },
    new Date("2026-08-03T16:59:59.000Z"),
  );

  assert.equal(result.valid, true);
  assert.equal(result.status, "active");
  assert.equal(result.expires_on, "2026-08-03");
  assert.equal(result.name, "A");
  assert.equal("key" in result, false);
});


test("expired, missing and malformed records are denied", () => {
  assert.equal(
    evaluateLicenseRecord(
      { key: "K", time: "02/08/2026", name: "" },
      new Date("2026-08-03T00:00:00.000Z"),
    ).status,
    "expired",
  );
  assert.equal(evaluateLicenseRecord(null, new Date()).status, "not_found");
  assert.equal(
    evaluateLicenseRecord({ key: "K", time: "bad", name: "" }, new Date()).status,
    "invalid_record",
  );
});
