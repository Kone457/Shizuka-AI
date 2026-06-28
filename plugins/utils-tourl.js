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

    let link = await catbox(media);

    let txt = `*乂 C A T B O X - U P L O A D E R 乂*\n\n`;
    txt += `*» Enlace* : ${link}\n`;
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;

    await conn.sendFile(m.chat, media, 'thumbnail.jpg', txt, m);
  } catch (e) {
    console.error(e);
    await m.reply(`《✧》 Error al subir el archivo.\n\n*Detalles*: ${e.message}`);
  }
};

handler.help = ['catbox'];
handler.tags = ['tools'];
handler.command = ['catbox'];

export default handler;

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function catbox(buffer) {
  const type = await fileTypeFromBuffer(buffer);
  if (!type) throw new Error("No se pudo detectar el tipo de archivo.");

  const { ext, mime } = type;
  const blob = new Blob([buffer], { type: mime });

  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append(
    "fileToUpload",
    blob,
    `${crypto.randomBytes(5).toString("hex")}.${ext}`
  );

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form
  });

  const text = await res.text();

  if (!res.ok || !text.startsWith("https://")) {
    throw new Error(text || "Error al subir a Catbox.");
  }

  return text.trim();
}