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

    const uploaders = (/image/.test(mime) && mime !== 'image/webp')
      ? [telegraph, catbox, quax]
      : [catbox, quax];

    let { link, name } = await uploadWithFallback(media, uploaders);

    let txt = `*乂 ${name.toUpperCase()} U P L O A D E R 乂*\n\n`;
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
      let link = await uploader(buffer);
      return { link, name: uploader.name };
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
  const randomBytes = crypto.randomBytes(5).toString("hex");

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `${randomBytes}.${ext}`);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Catbox upload failed");

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

  const res = await fetch("https://qu.ax/upload.php", {
    method: "POST",
    body: form
  });

  const result = await res.json();

  if (!result?.success || !result?.files || !result.files.length) {
    throw new Error("Failed to upload to qu.ax");
  }

  const file = result.files[0];

  if (file.url) {
    let direct = file.url;
    if (!direct.endsWith(`.${ext}`)) {
      direct = `${direct}.${ext}`;
    }
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

  if (mime === "image/webp") {
    throw new Error("Telegraph no soporta imágenes en formato WEBP");
  }

  if (!mime.startsWith("image/") && !mime.startsWith("video/")) {
    throw new Error("Telegraph solo soporta imágenes y videos cortos");
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: mime });
  form.append("file", blob, `tmp.${ext}`);

  const res = await fetch("https://telegra.ph/upload", {
    method: "POST",
    body: form,
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Error de Telegraph: ${data.error}`);
  }

  if (!Array.isArray(data) || !data[0]?.src) {
    throw new Error("Telegraph no devolvió un enlace válido");
  }

  return `https://telegra.ph${data[0].src}`;
}
