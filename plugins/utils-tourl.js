import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, File } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!mime) {
    return conn.reply(m.chat, "《✧》 Responde a un archivo válido.", m);
  }

  try {
    const media = await q.download();
    const link = await upload0x0(media);

    const txt = `*乂 0x0.st - U P L O A D E R 乂*\n\n`
      + `*» Enlace:* ${link}\n`
      + `*» Tamaño:* ${formatBytes(media.length)}\n`;

    await conn.sendFile(m.chat, media, "file", txt, m);
  } catch (e) {
    console.error(e);
    m.reply(`《✧》 Error al subir el archivo.\n\n*Detalles:* ${e.message}`);
  }
};

handler.help = ["tourl2"];
handler.tags = ["tools"];
handler.command = ["tourl2"];

export default handler;

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

async function upload0x0(buffer) {
  const type = await fileTypeFromBuffer(buffer);

  if (!type) throw new Error("No se pudo detectar el tipo de archivo.");

  const form = new FormData();

  form.set(
    "file",
    new File(
      [buffer],
      `${crypto.randomBytes(6).toString("hex")}.${type.ext}`,
      {
        type: type.mime
      }
    )
  );

  const res = await fetch("https://0x0.st", {
    method: "POST",
    body: form,
    headers: {
      ...form.headers,
      "User-Agent": "Shizuka-AI/3.5.1"
    }
  });

  const text = (await res.text()).trim();

  if (!res.ok) throw new Error(text);

  if (!text.startsWith("https://")) {
    throw new Error(text);
  }

  return text;
}