import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react("💋");

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    if (!mime) return conn.reply(m.chat, `🌸 Amor... responde a una imagen para que pueda tocarla.`, m);
    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`💦 Ese formato (${mime}) no me excita... usa JPG o PNG, por favor.`);

    let media = await q.download();
    let isTele = /image\/(png|jpe?g|gif)/.test(mime);
    let link = await (isTele ? uploadImage : uploadFile)(media);

    conn.reply(m.chat, `✨ Estoy mejorando tu imagen... quiero que se vea tan hermosa como tú.`, m);
    const result = await enhanceWithVreden(link);
    if (!result || !result.url) throw "No pude mejorarla... quizás necesitas abrazarme más fuerte.";

    const res = await fetch(result.url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) throw `No pude descargar la imagen mejorada: ${res.status}`;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const imgBuffer = await res.buffer();

    let txt = `💖 *Imagen lista, cariño...* 💖\n\n`;
    txt += `🔹 *Original* : ${link}\n`;
    txt += `🔹 *Mejorada* : ${result.url}\n`;
    txt += `🔹 *Acortado* : ${await shortUrl(result.url)}\n`;
    txt += `🔹 *Tamaño original* : ${formatBytes(media.length)}\n`;
    txt += `🔹 *Tamaño Mejorada* : ${formatBytes(result.filesize)}\n`;
    txt += `🔹 *Tipo* : ${result.mimetype}\n`;
    txt += `🔹 *Archivo* : ${result.filename}\n`;
    txt += `🔹 *Expiración* : ${isTele ? 'No expira, como mis ganas de verte' : 'Desconocido'}\n\n`;
    txt += `💋 *Con cariño, Shizuka*`;

    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      caption: txt,
      mimetype: contentType,
      fileName: 'imagen_mejorada.jpg'
    }, { quoted: m });

    await m.react("✅");
  } catch (e) {
    console.error("❌ Error:", e);
    await m.react("😢");
    m.reply("😔 No pude mejorarla... pero si me abrazas, lo intento otra vez.");
  }
};

handler.help = ["remini"];
handler.tags = ["tools"];
handler.command = ["remini", "hd", "enhance"];

export default handler;

// 💗 Mejora visual con ternura
async function enhanceWithVreden(imageUrl) {
  const api = `https://api.vreden.my.id/api/artificial/hdr?url=${encodeURIComponent(imageUrl)}&pixel=4`;
  const res = await fetch(api);
  const json = await res.json();

  const data = json?.result?.data;
  const success = data?.status === "success";
  const url = data?.downloadUrls?.[0];

  return success && url
    ? {
        url,
        filesize: data.filesize,
        mimetype: data.imagemimetype,
        filename: data.originalfilename
      }
    : null;
}

// 🧮 Tamaño en bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

// 🔗 Acortador
async function shortUrl(url) {
  let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`);
  return await res.text();
}