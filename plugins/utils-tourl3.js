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
    const link = await uploadImgBB(media, "Archivo");

    const txt = `*» URL:* ${link.url}`;

    await conn.sendFile(m.chat, link.image, "archivo.jpg", txt, m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`《✧》 Error al subir el archivo.\n\n*Detalles:* ${e.message}`);
  }
};

handler.help = ["tourl3"];
handler.tags = ["tools"];
handler.command = ["tourl3"];

export default handler;

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

async function uploadImgBB(buffer, filename) {
  const type = await fileTypeFromBuffer(buffer);
  if (!type) throw new Error("No se pudo detectar el tipo de archivo.");

  const form = new FormData();
  form.set("image", new File([buffer], `${crypto.randomBytes(6).toString("hex")}.${type.ext}`, { type: type.mime }));
  form.set("filename", filename);

  const res = await fetch(`${global.api.url2}/tools/ibb?image=https://i.postimg.cc/nV33jgMb/kfko.jpg&filename=${encodeURIComponent(filename)}`, {
    method: "POST",
    body: form,
    headers: form.headers
  });

  const json = await res.json();
  if (!json.status || !json.data) throw new Error("La subida falló.");

  return json.data;
}