import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.reply(m.chat, '《✧》 Por favor, responde a un archivo válido.', m);

  try {
    let media = await q.download();
    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);

    
    let link = await uploadWithFallback(media);

    let txt = `*乂 M U L T I - U P L O A D E R 乂*\n\n`;
    txt += `*» Enlace* : ${link}\n`;
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;
    txt += `*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}\n`;

    await conn.sendFile(m.chat, media, 'thumbnail.jpg', txt, m);
  } catch (e) {
    console.error(e);
    await m.reply(`《✧》 Error al subir el archivo.\n\n*Detalles*: ${e.message}`);
  }
};

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = ['catbox', 'tourl'];

export default handler;

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function uploadWithFallback(buffer) {
  const uploaders = [catbox, telegraph, quax];
  let lastError;
  for (const uploader of uploaders) {
    try {
      return await uploader(buffer);
    } catch (err) {
      console.error(`Uploader failed: ${uploader.name}`, err);
      lastError = err;
    }
  }
  throw lastError || new Error("No se pudo subir el archivo a ninguna nube.");
}

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `${randomBytes}.${ext}`);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Catbox upload failed");
  return await response.text();
}

async function quax(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  form.append("files[]", blob, "tmp." + ext);
  const res = await fetch("https://qu.ax/upload.php", { method: "POST", body: form });
  const result = await res.json();
  if (result && result.success) {
    return result.files[0].url;
  } else {
    throw new Error("Failed to upload to qu.ax");
  }
}

async function telegraph(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  form.append("file", blob, "tmp." + ext);
  const res = await fetch("https://telegra.ph/upload", { method: "POST", body: form });
  const img = await res.json();
  if (img.error) throw new Error(img.error);
  return "https://telegra.ph" + img[0].src;
}