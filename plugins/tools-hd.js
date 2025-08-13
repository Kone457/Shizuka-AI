import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react("🕓");

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    if (!mime) return conn.reply(m.chat, `❀ Por favor, responde a una imagen.`, m);
    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`✧ El formato (${mime}) no es compatible. Usa JPG o PNG.`);

    let media = await q.download();
    let isTele = /image\/(png|jpe?g|gif)/.test(mime);
    let link = await (isTele ? uploadImage : uploadFile)(media);

    conn.reply(m.chat, `✧ Invocando mejora visual ceremonial...`, m);
    let enhanced = await enhanceImage(link);
    if (!enhanced) throw "No se pudo mejorar la imagen.";

    // Descargamos la imagen mejorada
    const res = await fetch(enhanced);
    const contentType = res.headers.get("content-type") || "image/webp";
    const imgBuffer = await res.buffer();

    // Construimos el mensaje ritualizado
    let txt = `乂  *I M A G E N   R I T U A L I Z A D A*  乂\n\n`;
    txt += `*» Enlace original* : ${link}\n`;
    txt += `*» Enlace mejorado* : ${enhanced}\n`;
    txt += `*» Acortado* : ${await shortUrl(enhanced)}\n`;
    txt +=* : ${formatBytes(media.length)}\n`;
    txt += `*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}\n\n`;
    txt += `> *Plugin ceremonial por Carlos & Copilot*`;

    // Enviamos la imagen como archivo visual, no sticker
    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      caption: txt,
      mimetype: contentType,
      fileName: 'imagen_mejorada.webp'
    }, { quoted: m });

    await m.react("✅");
  } catch (e) {
    console.error(e);
    await m.react("✖️");
    m.reply("⚠️ El ritual falló. Intenta nuevamente.");
  }
};

handler.help = ["remini"];
handler.tags = ["tools"];
handler.command = ["remini", "hd", "enhance"];

export default handler;

// 🧙‍♂️ Mejora visual usando la API de Vreden
async function enhanceImage(imageUrl) {
  const api = `https://api.vreden.my.id/api/artificial/aiease/img2img/enhance?url=${encodeURIComponent(imageUrl)}`;
  const res = await fetch(api);
  const json = await res.json();
  if (json.status !== 200 || !json.result?.[0]?.origin) return null;
  return json.result[0].origin;
}

// 🧮 Tamaño en bytes ritualizado
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

// 🔗 Acortador ceremonial
async function shortUrl(url) {
  let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`);
  return await res.text();
}