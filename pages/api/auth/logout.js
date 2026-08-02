import { expiredSessionCookie } from "../../../lib/auth.mjs";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Set-Cookie", expiredSessionCookie());
  return res.status(200).json({ authenticated: false });
}
