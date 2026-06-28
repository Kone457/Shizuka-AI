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
    const media = await q.download();
    const link = await uploadUguu(media);

    const txt = `*乂 U G U U - U P L O A D E R 乂*\n\n`
      + `*» Enlace:* ${link}\n`
      + `*» Tamaño:* ${formatBytes(media.length)}`;

    await conn.sendFile(m.chat, media, "archivo", txt, m);
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

  if (!res.ok) {
    throw new Error(json.message || "Error al subir el archivo.");
  }

  if (!json.success || !json.files?.length) {
    throw new Error(json.message || "La subida falló.");
  }

  return json.files[0].url;
}