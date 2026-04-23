import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn, args }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return conn.reply(m.chat, '《✧》 Por favor, responde a una imagen válida.', m);

  const prompt = args.join(' ').trim();
  if (!prompt) return conn.reply(m.chat, '《✧》 Escribe un *prompt* para editar la imagen.', m);

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

    let media = await q.download();
    let link = await catbox(media);

    await conn.sendMessage(m.chat, { react: { text: '🖌️', key: m.key } });

    const controller = new AbortController();
    
    const timeout = setTimeout(() => controller.abort(), 180000);

    const apiUrl = `${api.url3}/faa/editfoto?url=${encodeURIComponent(link)}&prompt=${encodeURIComponent(prompt)}`;
    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

    const arrayBuffer = await res.arrayBuffer();
    let edited = Buffer.from(arrayBuffer);

    await conn.sendMessage(m.chat, { react: { text: '🎆', key: m.key } });

    await conn.sendFile(m.chat, edited, 'edit.jpg', `*乂 I M A G E - E D I T O R 乂*\n\n*» Prompt* : ${prompt}`, m);
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: '🎟️', key: m.key } });
    await m.reply(`《✧》 Error al editar la imagen.\n\n*Detalles*: ${e.message}`);
  }
};

handler.help = ['editar'];
handler.tags = ['tools'];
handler.command = ['editar','editfoto','editimg'];
handler.group = true;

export default handler;

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