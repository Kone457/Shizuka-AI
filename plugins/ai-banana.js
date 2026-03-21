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

    if (!mime) return m.reply('📦 *乂  E R R O R  乂*\n\n✩  *Motivo* : No respondiste a una imagen.\n✩  *Uso* : Reacciona a una foto con el comando.');

    const prompt = args.join(' ').trim();
    if (!prompt) return m.reply('✏️ *乂  E R R O R  乂*\n\n✩  *Motivo* : Falta el prompt.\n✩  *Ejemplo* : .banana ponle un sombrero.');

    try {
      await client.sendMessage(m.chat, { react: { text: '🍌', key: m.key } });

      let media = await q.download();
      let link = await catbox(media);

      await client.sendMessage(m.chat, { react: { text: '🐒', key: m.key } });

      const apiUrl = `https://api-faa.my.id/faa/nano-banana?url=${encodeURIComponent(link)}&prompt=${encodeURIComponent(prompt)}`;
      const res = await fetch(apiUrl);

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const buffer = await res.buffer();

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      const caption = `*乂  N A N O  -  B A N A N A  乂*\n\n` +
                      `✩  *Prompt* : ${prompt}\n` +
                      `✩  *Estado* : Editada con éxito\n` +
                      `✩  *Motor* : Nano Banana IA`

      await client.sendMessage(m.chat, {
        image: buffer,
        caption: caption
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      await client.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
      await m.reply(`*乂  E R R O R  乂*\n\n✩  *Detalle* : ${e.message}\n✩  *Nota* : Es posible que la API esté caída.`);
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
