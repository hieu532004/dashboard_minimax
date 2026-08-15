import clientPromise from "../../../lib/mongodb";
import {
  evaluateLicenseRecord,
  isSupportedLicenseKey,
  normalizeLicenseKey,
} from "../../../lib/license.mjs";

const DB_NAME = process.env.MONGODB_DB || "minimax";
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || "keys";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = normalizeLicenseKey(req.body?.key);
  if (!isSupportedLicenseKey(key)) {
    return res.status(400).json({ error: "CPU KEY không hợp lệ" });
  }

  try {
    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    const record = await collection.findOne(
      { key },
      { projection: { _id: 0, time: 1, name: 1 } },
    );
    return res.status(200).json(evaluateLicenseRecord(record));
  } catch (error) {
    console.error("POST /api/license/validate error:", error);
    return res.status(503).json({ error: "License service unavailable" });
  }
}
