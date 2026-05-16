import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!mime) {
    return conn.reply(
      m.chat,
      '《✧》 Responde a una imagen válida.',
      m
    );
  }

  if (!mime.startsWith('image/')) {
    return conn.reply(
      m.chat,
      '《✧》 Solo se permiten imágenes.',
      m
    );
  }

  try {
    let media = await q.download();

    let link = await postimg(media);

    let txt = `*乂 P O S T I M G - U P L O A D E R 乂*\n\n`;
    txt += `*» Enlace* : ${link}\n`;
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;
    txt += `*» Expiración* : No expira`;

    await conn.sendFile(
      m.chat,
      media,
      'postimg.jpg',
      txt,
      m
    );

  } catch (e) {
    console.error(e);

    await conn.reply(
      m.chat,
      `《✧》 Error al subir la imagen.\n\n*Detalles*: ${e.message}`,
      m
    );
  }
};

handler.help = ['postimg'];
handler.tags = ['tools'];
handler.command = ['postimg'];

export default handler;

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function postimg(buffer) {
  const type = await fileTypeFromBuffer(buffer);

  if (!type) {
    throw new Error("Formato no soportado");
  }

  const { ext, mime } = type;

  const form = new FormData();

  const blob = new Blob([buffer], { type: mime });

  form.append("upload", blob, `image.${ext}`);

  const res = await fetch("https://postimages.org/json/rr", {
    method: "POST",
    body: form,
    headers: {
      accept: "application/json",
      origin: "https://postimages.org",
      referer: "https://postimages.org/"
    }
  });

  const data = await res.json();

  if (!data?.url) {
    console.log(data);
    throw new Error("PostImages no devolvió enlace");
  }

  return data.url;
}