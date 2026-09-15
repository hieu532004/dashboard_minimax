import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import {
  isElevenlabDeviceKey,
  isLicenseNonce,
  issueElevenlabLicense,
} from "../lib/elevenlab-license.mjs";

const DEVICE = "ELB-ABCDE-FGHIJ-KLMNO-PQRST-UVWXY";
const NONCE = "a".repeat(43);
const { privateKey, publicKey } = generateKeyPairSync("ed25519");

test("only accepts ElevenLab machine keys and a request nonce", () => {
  assert.equal(isElevenlabDeviceKey(DEVICE), true);
  assert.equal(isElevenlabDeviceKey("ASE-ABCDE-FGHIJ-KLMNO-PQRST-UVWXY"), false);
  assert.equal(isLicenseNonce(NONCE), true);
  assert.equal(isLicenseNonce("short"), false);
});

test("issues a short-lived Ed25519 token bound to device and nonce", () => {
  const now = new Date("2026-09-15T10:00:00.000Z");
  const token = issueElevenlabLicense(
    { time: "30/09/2026", name: "Khách thử" }, DEVICE, NONCE, privateKey, now,
  );
  const [header, payload, signature] = token.split(".");
  assert.equal(
    verify(null, Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, "base64url")),
    true,
  );
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  assert.equal(claims.device, DEVICE);
  assert.equal(claims.nonce, NONCE);
  assert.equal(claims.exp - claims.iat, 300);
});

test("does not sign missing or expired licenses", () => {
  const now = new Date("2026-09-15T10:00:00.000Z");
  assert.equal(issueElevenlabLicense(null, DEVICE, NONCE, privateKey, now), null);
  assert.equal(
    issueElevenlabLicense({ time: "14/09/2026", name: "A" }, DEVICE, NONCE, privateKey, now),
    null,
  );
});
