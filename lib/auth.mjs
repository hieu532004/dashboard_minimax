import crypto from "node:crypto";

export const SESSION_COOKIE = "ase_dashboard_session";
const SESSION_SECONDS = 24 * 60 * 60;

function defaultSecret() {
  const configured = process.env.DASHBOARD_AUTH_SECRET;
  if (configured) return configured;
  // Backward-compatible deployment fallback. MONGODB_URI is already a Vercel
  // server secret and never enters the browser bundle.
  return crypto
    .createHash("sha256")
    .update(`ase-dashboard-auth-v1\0${process.env.MONGODB_URI ?? "local-development"}`)
    .digest("hex");
}

function signature(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left, right) {
  const a = crypto.createHash("sha256").update(String(left)).digest();
  const b = crypto.createHash("sha256").update(String(right)).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken({ username, now = new Date(), secret = defaultSecret() }) {
  const payload = Buffer.from(
    JSON.stringify({ username, exp: Math.floor(now.getTime() / 1000) + SESSION_SECONDS }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function verifySessionToken(token, { now = new Date(), secret = defaultSecret() } = {}) {
  try {
    const [payload, suppliedSignature, extra] = String(token ?? "").split(".");
    if (!payload || !suppliedSignature || extra) return null;
    if (!safeEqual(suppliedSignature, signature(payload, secret))) return null;
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof value.username !== "string" ||
      !value.username ||
      !Number.isInteger(value.exp) ||
      value.exp < Math.floor(now.getTime() / 1000)
    ) return null;
    return { username: value.username };
  } catch {
    return null;
  }
}

export function credentialsAreValid(username, password) {
  const expectedUsername = process.env.DASHBOARD_ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.DASHBOARD_ADMIN_PASSWORD || "123456";
  return safeEqual(String(username ?? "").trim(), expectedUsername) &&
    safeEqual(String(password ?? ""), expectedPassword);
}

function cookiesFromRequest(req) {
  const header = String(req.headers?.cookie ?? "");
  return Object.fromEntries(
    header.split(";").map((entry) => {
      const separator = entry.indexOf("=");
      if (separator < 0) return ["", ""];
      return [entry.slice(0, separator).trim(), decodeURIComponent(entry.slice(separator + 1))];
    }),
  );
}

export function authorizedUser(req) {
  return verifySessionToken(cookiesFromRequest(req)[SESSION_COOKIE]);
}

export function sessionCookie(token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function expiredSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}
