import { randomUUID, sign } from "node:crypto";
import { evaluateLicenseRecord, parseExpiryDate } from "./license.mjs";

export const ELEVENLAB_LICENSE_ISSUER = "th-elevenlab-license";
export const ELEVENLAB_LICENSE_AUDIENCE = "elevenlabs";
export const ELEVENLAB_LICENSE_KEY_ID = "th-elevenlab-license-v1";

const b64url = (value) => Buffer.from(value).toString("base64url");

export function isElevenlabDeviceKey(value) {
  return /^ELB(?:-[A-Z2-7]{5}){5}$/.test(String(value ?? ""));
}

export function isLicenseNonce(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{32,96}$/.test(value);
}

export function issueElevenlabLicense(record, device, nonce, privateKey, now = new Date()) {
  if (!isElevenlabDeviceKey(device) || !isLicenseNonce(nonce)) {
    throw new Error("Invalid license request");
  }
  if (privateKey?.asymmetricKeyType !== "ed25519") {
    throw new Error("Ed25519 signing key is required");
  }
  const status = evaluateLicenseRecord(record, now);
  if (!status.valid) return null;
  const expiry = parseExpiryDate(record.time);
  // dd/mm/yyyy còn hiệu lực đến 23:59:59 giờ Bangkok (UTC+7).
  const licenseExp = Math.floor(Date.UTC(expiry.year, expiry.month - 1, expiry.day, 16, 59, 59) / 1000);
  const issuedAt = Math.floor(now.getTime() / 1000);
  const expiresAt = Math.min(issuedAt + 300, licenseExp);
  if (expiresAt <= issuedAt) return null;

  const header = { alg: "EdDSA", kid: ELEVENLAB_LICENSE_KEY_ID, typ: "JWT" };
  const claims = {
    iss: ELEVENLAB_LICENSE_ISSUER,
    aud: ELEVENLAB_LICENSE_AUDIENCE,
    device,
    nonce,
    name: String(record.name ?? "").trim().slice(0, 160) || "Khách hàng",
    jti: randomUUID(),
    iat: issuedAt,
    exp: expiresAt,
    license_exp: licenseExp,
    days_left: Math.min(999999, Math.max(0, Math.ceil((licenseExp - issuedAt) / 86400))),
    ver: 1,
  };
  const message = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  return `${message}.${sign(null, Buffer.from(message, "ascii"), privateKey).toString("base64url")}`;
}
