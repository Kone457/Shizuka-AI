import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, File } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!mime) {
    return conn.reply(m.chat, "《✧》 Por favor, responde a un archivo válido.", m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const media = await q.download();
    const link = await uploadUguu(media);

    const upscaleUrl = `${global.api.url2}/ia/upscale?image=${encodeURIComponent(link)}`;

    const txt = `*乂 H D - U P S C A L E R 乂*\n\n`
      + `*» Tamaño:* ${formatBytes(media.length)}`;

    await conn.sendFile(m.chat, upscaleUrl, "upscaled.jpg", txt, m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`《✧》 Error al procesar el archivo.\n\n*Detalles:* ${e.message}`);
  }
};

handler.help = ["hd"];
handler.tags = ["tools"];
handler.command = ["hd"];

export default handler;

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

async function uploadUguu(buffer) {
  const type = await fileTypeFromBuffer(buffer);

  if (!type) throw new Error("No se pudo detectar el tipo de archivo.");

  const form = new FormData();
  form.set(
    "files[]",
    new File(
      [buffer],
      `${crypto.randomBytes(6).toString("hex")}.${type.ext}`,
      { type: type.mime }
    )
  );

  const res = await fetch("https://uguu.se/upload.php", {
    method: "POST",
    body: form,
    headers: form.headers
  });

  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Error al subir el archivo.");
  if (!json.success || !json.files?.length) throw new Error("La subida falló.");

  return json.files[0].url;
}