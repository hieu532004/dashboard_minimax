import { generateKeyPairSync } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const publicDer = publicKey.export({ format: "der", type: "spki" });
const privateDer = privateKey.export({ format: "der", type: "pkcs8" });
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const secretPath = resolve(projectRoot, ".env.local");
writeFileSync(
  secretPath,
  `TH_ELEVENLAB_LICENSE_PRIVATE_KEY_DER_B64=${privateDer.toString("base64")}\n`,
  { flag: "wx", mode: 0o600 },
);

console.log("Private key đã lưu trong .env.local (gitignored); không commit hoặc gửi cho máy khách.");
console.log(`TH_ELEVENLAB_LICENSE_PUBLIC_KEY_B64=${publicDer.subarray(-32).toString("base64")}`);
