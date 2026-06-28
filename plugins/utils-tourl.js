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
    const link = await catbox(media);

    const txt = `*乂 C A T B O X - U P L O A D E R 乂*\n\n`
      + `*» Enlace* : ${link}\n`
      + `*» Tamaño* : ${formatBytes(media.length)}\n`;

    await conn.sendFile(m.chat, media, "thumbnail.jpg", txt, m);
  } catch (e) {
    console.error(e);
    await m.reply(`《✧》 Error al subir el archivo.\n\n*Detalles*: ${e.message}`);
  }
};

handler.help = ["catbox"];
handler.tags = ["tools"];
handler.command = ["catbox"];

export default handler;

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

async function catbox(buffer) {
  const type = await fileTypeFromBuffer(buffer);

  if (!type) {
    throw new Error("No se pudo detectar el tipo de archivo.");
  }

  const form = new FormData();

  form.set("reqtype", "fileupload");
  form.set(
    "fileToUpload",
    new File(
      [buffer],
      `${crypto.randomBytes(5).toString("hex")}.${type.ext}`,
      {
        type: type.mime
      }
    )
  );

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
    headers: form.headers
  });

  const text = (await res.text()).trim();

  console.log("Catbox Status:", res.status);
  console.log("Catbox Response:", text);

  if (!res.ok) {
    throw new Error(text);
  }

  if (!text.startsWith("https://")) {
    throw new Error(text);
  }

  return text;
}