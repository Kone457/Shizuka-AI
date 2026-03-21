import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

export default {
  command: ["nanobanana", "banana"],
  category: "ai",
  run: async (client, m, args) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) return m.reply('📦 Responde a una imagen válida.');

    const prompt = args.join(' ').trim();
    if (!prompt) return m.reply('✏️ Escribe un *prompt*.');

    try {
      await client.sendMessage(m.chat, { react: { text: '🍌', key: m.key } });

      let media = await q.download();
      let link = await catbox(media);

      await client.sendMessage(m.chat, { react: { text: '🐒', key: m.key } });

      const apiUrl = `https://api-faa.my.id/faa/nano-banana?url=${encodeURIComponent(link)}&prompt=${encodeURIComponent(prompt)}`;
      const res = await fetch(apiUrl);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const arrayBuffer = await res.arrayBuffer();
      let edited = Buffer.from(arrayBuffer);

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      const caption = `*乂  N A N O  -  B A N A N A  乂*\n\n` +
                      `✩  *Prompt* : ${prompt}\n` +
                      `✩  *Estado* : Editada con éxito\n` +
                      `✩  *Motor* : Nano Banana IA`

      await client.sendMessage(m.chat, {
        image: edited,
        caption: caption
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      await client.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
      await m.reply(`❌ Error: ${e.message}`);
    }
  }
}

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `${randomBytes}.${ext}`);
  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return await response.text();
}
