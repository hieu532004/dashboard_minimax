const LICENSE_KEY_PATTERN = /^(ASE|AVY)(?:-[A-Z2-7]{5}){5}$/;

const LICENSE_PRODUCTS = Object.freeze({
  ASE: "Auto Scene Alternator",
  AVY: "AutoVideo AI",
});

export function normalizeLicenseKey(value) {
  return String(value ?? "").trim().toUpperCase();
}

export function isAutoSceneLicenseKey(value) {
  return /^ASE(?:-[A-Z2-7]{5}){5}$/.test(normalizeLicenseKey(value));
}

export function isSupportedLicenseKey(value) {
  return LICENSE_KEY_PATTERN.test(normalizeLicenseKey(value));
}

export function licenseProduct(value) {
  const prefix = normalizeLicenseKey(value).split("-", 1)[0];
  return LICENSE_PRODUCTS[prefix] || "Unknown";
}

export function parseExpiryDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) return null;
  return {
    year,
    month,
    day,
    iso: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

function bangkokDateParts(now) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function dateOrdinal(value) {
  return value.year * 10000 + value.month * 100 + value.day;
}

export function evaluateLicenseRecord(record, now = new Date()) {
  const server_time = now.toISOString();
  if (!record) {
    return { valid: false, status: "not_found", expires_on: null, name: "", server_time };
  }
  const expiry = parseExpiryDate(record.time);
  if (!expiry) {
    return {
      valid: false,
      status: "invalid_record",
      expires_on: null,
      name: String(record.name ?? "").slice(0, 200),
      server_time,
    };
  }
  const expired = dateOrdinal(bangkokDateParts(now)) > dateOrdinal(expiry);
  return {
    valid: !expired,
    status: expired ? "expired" : "active",
    expires_on: expiry.iso,
    name: String(record.name ?? "").slice(0, 200),
    server_time,
  };
}
