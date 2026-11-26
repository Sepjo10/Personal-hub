import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Cifrado del refresh token con AES-256-GCM.
 * - La clave (32 bytes en base64) vive solo en GOOGLE_TOKEN_KEY.
 * - Cada cifrado usa un IV aleatorio de 12 bytes.
 * - GCM añade una "etiqueta" que detecta si alguien ha manipulado el texto cifrado.
 * Formato guardado: "iv.etiqueta.datos", cada parte en base64.
 */
function getKey(): Buffer {
  const key = Buffer.from(process.env.GOOGLE_TOKEN_KEY ?? "", "base64");
  if (key.length !== 32) throw new Error("GOOGLE_TOKEN_KEY debe ser una clave de 32 bytes en base64.");
  return key;
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

export function decrypt(payload: string): string {
  const [iv, tag, data] = payload.split(".").map((part) => Buffer.from(part, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
