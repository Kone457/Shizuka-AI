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
      '《✧》 Por favor, responde a un archivo válido.',
      m
    );
  }

  try {
    let media = await q.download();

    const uploaders = /image/.test(mime)
      ? [telegraph, catbox, quax]
      : [catbox, quax];

    let link = await uploadWithFallback(media, uploaders);

    let txt = `*乂 M U L T I - U P L O A D E R 乂*\n\n`;
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

async function uploadWithFallback(buffer, uploaders) {
  let lastError;

  for (const uploader of uploaders) {
    try {
      return await uploader(buffer);
    } catch (err) {
      console.error(`Uploader failed: ${uploader.name}`, err);
      lastError = err;
    }
  }

  throw lastError || new Error(
    "No se pudo subir el archivo a ninguna nube."
  );
}

async function catbox(buffer) {
  const type = await fileTypeFromBuffer(buffer);

  if (!type) {
    throw new Error("Tipo de archivo no soportado");
  }

  const { ext, mime } = type;

  const blob = new Blob([buffer], { type: mime });

  const formData = new FormData();

  const randomBytes = crypto
    .randomBytes(5)
    .toString("hex");

  formData.append("reqtype", "fileupload");

  formData.append(
    "fileToUpload",
    blob,
    `${randomBytes}.${ext}`
  );

  const response = await fetch(
    "https://catbox.moe/user/api.php",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Catbox upload failed");
  }

  const text = await response.text();

  if (!text.startsWith("https://")) {
    throw new Error("Catbox no devolvió un enlace válido");
  }

  return text.trim();
}

async function quax(buffer) {
  const type = await fileTypeFromBuffer(buffer);

  if (!type) {
    throw new Error("Tipo de archivo no soportado");
  }

  const { ext, mime } = type;

  const form = new FormData();

  const filename = `${crypto.randomBytes(4).toString("hex")}.${ext}`;

  const blob = new Blob([buffer], { type: mime });

  form.append("files[]", blob, filename);

  const res = await fetch(
    "https://qu.ax/upload.php",
    {
      method: "POST",
      body: form
    }
  );

  const result = await res.json();

  if (
    !result?.success ||
    !result?.files ||
    !result.files.length
  ) {
    throw new Error("Failed to upload to qu.ax");
  }

  const file = result.files[0];

  if (file.url) {
    const direct = file.url.includes('.')
      ? file.url
      : `${file.url}.${ext}`;

    return direct;
  }

  throw new Error("Qu.ax no devolvió enlace");
}

async function telegraph(buffer) {
  const type = await fileTypeFromBuffer(buffer);

  if (!type) {
    throw new Error("Tipo de archivo no soportado");
  }

  const { ext, mime } = type;

  if (!mime.startsWith("image/")) {
    throw new Error("Telegraph solo soporta imágenes");
  }

  const form = new FormData();

  const blob = new Blob([buffer], { type: mime });

  form.append(
    "file",
    blob,
    `tmp.${ext}`
  );

  const res = await fetch(
    "https://telegra.ph/upload",
    {
      method: "POST",
      body: form
    }
  );

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("Respuesta inválida de Telegraph");
  }

  if (!data[0]?.src) {
    throw new Error(
      data[0]?.error ||
      "Telegraph no devolvió enlace"
    );
  }

  return `https://telegra.ph${data[0].src}`;
}