import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `${randomBytes}.${ext}`);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  return await response.text();
}

async function getEnhancedBuffer(url) {
  const res = await fetch("https://api.deepai.org/api/torch-srgan", {
    method: "POST",
    headers: { "Api-Key": process.env.DEEPAI_KEY },
    body: new URLSearchParams({ image: url }),
  });

  if (!res.ok) return null;
  const json = await res.json();

  const enhancedRes = await fetch(json.output_url);
  return Buffer.from(await enhancedRes.arrayBuffer());
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

let handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    if (!mime) return conn.reply(m.chat, "📦 Por favor, responde a un archivo válido (imagen).", m);

    if (!/image\/(png|jpe?g)/.test(mime)) {
      return m.reply(`> El formato *${mime}* no es compatible. Usa JPG o PNG.`);
    }

    let media = await q.download();
    let link = await catbox(media);

    if (!link) {
      return m.reply("> No se pudo subir la imagen. Intenta nuevamente.");
    }

    let enhancedBuffer = await getEnhancedBuffer(link);

    if (!enhancedBuffer) {
      return m.reply("> No se pudo obtener la imagen mejorada.");
    }

    let txt = `*乂 H D  -  U P S C A L E R 乂*\n\n`;
    txt += `*» Enlace* : ${link}\n`;
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;
    txt += `*» Expiración* : No expira\n`;

    await conn.sendMessage(m.chat, { image: enhancedBuffer, caption: txt }, { quoted: m });
  } catch (err) {
    console.error(err);
    await m.reply("❌ Error al procesar la imagen.");
  }
};

handler.help = ["hd"];
handler.tags = ["tools"];
handler.command = ["hd"];

export default handler;