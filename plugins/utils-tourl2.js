import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!mime) {
    return conn.reply(
      m.chat,
      '《✧》 Por favor, responde a una imagen válida.',
      m
    );
  }

  try {
    let media = await q.download();
    let link = await postimages(media);

    let txt = `*乂 POSTIMAGES U P L O A D E R 乂*\n\n`;
    txt += `*» Enlace* : ${link}\n`;
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;
    txt += `*» Expiración* : No expira`;

    await conn.sendFile(
      m.chat,
      media,
      'thumbnail.jpg',
      txt,
      m
    );

  } catch (e) {
    console.error(e);
    await m.reply(
      `《✧》 Error al subir el archivo.\n\n*Detalles*: ${e.message}`
    );
  }
};

handler.help = ['postimg'];
handler.tags = ['tools'];
handler.command = ['postimg', 'postimages'];

export default handler;

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function postimages(buffer) {
  const type = await fileTypeFromBuffer(buffer);
  if (!type) {
    throw new Error("Tipo de archivo no soportado");
  }

  const { ext, mime } = type;

  if (!mime.startsWith("image/")) {
    throw new Error("Postimages solo soporta imágenes");
  }

  const form = new FormData();
  const uploadSession = crypto.randomBytes(16).toString("hex");
  const filename = `${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const blob = new Blob([buffer], { type: mime });

  form.append("file", blob, filename);
  form.append("upload_session", uploadSession);
  form.append("numfiles", "1");
  form.append("optsize", "0");
  form.append("expire", "0");

  const res = await fetch("https://postimages.org/json/rr", {
    method: "POST",
    body: form,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      "Origin": "https://postimages.org",
      "Referer": "https://postimages.org/"
    }
  });

  if (!res.ok) throw new Error("Postimages upload failed");

  const result = await res.json();
  if (result.status !== "OK" || !result.url) {
    throw new Error("Postimages no devolvió un enlace válido");
  }

  const id = result.url.split("/").pop();
  return `https://i.postimg.cc/${id}/${filename}`;
}
