import { authorizedUser } from "../../../lib/auth.mjs";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const user = authorizedUser(req);
  if (!user) return res.status(401).json({ authenticated: false });
  return res.status(200).json({ authenticated: true, username: user.username });
}
