import {
  createSessionToken,
  credentialsAreValid,
  sessionCookie,
} from "../../../lib/auth.mjs";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");
  if (!credentialsAreValid(username, password)) {
    return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
  }
  res.setHeader("Set-Cookie", sessionCookie(createSessionToken({ username })));
  return res.status(200).json({ authenticated: true, username });
}
