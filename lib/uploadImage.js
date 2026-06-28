import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, File } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

/**
 * Upload image to Uguu
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>} URL del archivo subido
 */
export default async (buffer) => {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {};

  const form = new FormData();
  const fileName = `${crypto.randomBytes(5).toString("hex")}.${ext || "bin"}`;

  form.set(
    "files[]",
    new File(
      [buffer],
      fileName,
      {
        type: mime || "application/octet-stream"
      }
    )
  );

  const res = await fetch("https://uguu.se/upload.php", {
    method: "POST",
    body: form,
    headers: form.headers
  });

  if (!res.ok) {
    throw new Error("❌ Falló la subida a Uguu");
  }

  const result = await res.json();

  if (result?.success && result.files?.length) {
    return result.files[0].url;
  } else {
    throw new Error("❌ Respuesta inválida de Uguu");
  }
};