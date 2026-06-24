import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

/**
 * Upload image to EvoGB Cloud
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>} URL del archivo subido
 */
export default async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {};
  const form = new FormData();
  const blob = new Blob([buffer], { type: mime || "application/octet-stream" });
  const fileName = `${crypto.randomBytes(5).toString("hex")}.${ext || "bin"}`;

  form.append("file", blob, fileName);

  const res = await fetch("https://evogb.win/api/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("❌ Falló la subida a EvoGB Cloud");
  }

  const result = await res.json();
  if (result && result.success && result.url) {
    return result.url; // Devuelve solo el enlace directo
  } else {
    throw new Error("❌ Respuesta inválida de EvoGB Cloud");
  }
};