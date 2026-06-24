/*
import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Upload file to Catbox
 * Supported mimetypes:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * - `video/mp4`
 * - `video/webm`
 * - `audio/mpeg`
 * - `audio/wav`
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>}
 */
export default async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  form.append('fileToUpload', blob, 'tmp.' + ext);
  form.append('reqtype', 'fileupload');
  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
  });
  const result = await res.text(); 
  if (result.startsWith('https://files.catbox.moe/')) {
    return result;
  } else {
    throw new Error('Failed to upload the file to Catbox');
  }
};
*/


import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

/**
 * Upload file to EvoGB Cloud
 * Supported mimetypes:
 * - image/jpeg, image/jpg, image/png
 * - video/mp4, video/webm
 * - audio/mpeg, audio/wav
 * @param {Buffer} buffer File Buffer
 * @return {Promise<{url:string,id:string,success:boolean}>}
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
  if (result && result.success) {
    return result; // { url, id, success }
  } else {
    throw new Error("❌ Respuesta inválida de EvoGB Cloud");
  }
};