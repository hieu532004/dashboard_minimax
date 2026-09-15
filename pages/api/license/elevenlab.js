import { createPrivateKey } from "node:crypto";
import clientPromise from "../../../lib/mongodb";
import {
  isElevenlabDeviceKey,
  isLicenseNonce,
  issueElevenlabLicense,
} from "../../../lib/elevenlab-license.mjs";
import { normalizeLicenseKey } from "../../../lib/license.mjs";

const DB_NAME = process.env.MONGODB_DB || "minimax";
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "keys";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const device = normalizeLicenseKey(req.body?.key);
  const nonce = req.body?.nonce;
  if (!isElevenlabDeviceKey(device) || !isLicenseNonce(nonce)) {
    return res.status(400).json({ error: "Invalid license request" });
  }

  const privateKeyB64 = process.env.TH_ELEVENLAB_LICENSE_PRIVATE_KEY_DER_B64;
  if (!privateKeyB64) {
    return res.status(503).json({ error: "License signing is not configured" });
  }
  try {
    const privateKey = createPrivateKey({
      key: Buffer.from(privateKeyB64, "base64"),
      format: "der",
      type: "pkcs8",
    });
    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    const record = await collection.findOne(
      { key: device },
      { projection: { _id: 0, time: 1, name: 1 } },
    );
    const token = issueElevenlabLicense(record, device, nonce, privateKey);
    if (!token) return res.status(403).json({ error: "License is not active" });
    res.setHeader("Content-Type", "application/jose; charset=utf-8");
    return res.status(200).end(token);
  } catch (error) {
    console.error("POST /api/license/elevenlab error:", error);
    return res.status(503).json({ error: "License service unavailable" });
  }
}
