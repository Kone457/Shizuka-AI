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

    console.log("🔗 Enlace original:", link);
    conn.reply(m.chat, `✧ Invocando mejora visual ceremonial...`, m);

    const result = await enhanceWithVreden(link);
    if (!result || !result.url) throw "⛔ No se pudo obtener imagen mejorada.";

    console.log("📸 Enlace mejorado:", result.url);

    const res = await fetch(result.url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) throw `Error al descargar imagen mejorada: ${res.status}`;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const imgBuffer = await res.buffer();

    let txt = `乂  *I M A G E N   R I T U A L I Z A D A*  乂\n\n`;
    txt += `*» Enlace original* : ${link}\n`;
    txt += `*» Enlace mejorado* : ${result.url}\n`;
    txt += `*» Acortado* : ${await shortUrl(result.url)}\n`;
    txt += `*» Tamaño original* : ${formatBytes(media.length)}\n`;
    txt += `*» Tamaño mejorado* : ${formatBytes(result.filesize)}\n`;
    txt += `*» Tipo MIME* : ${result.mimetype}\n`;
    txt += `*» Archivo original* : ${result.filename}\n`;
    txt += `*» Expiración* : ${isTele ? 'No expira' : 'Desconocido'}\n\n`;
    txt += `> *Plugin ceremonial por Carlos & Copilot*`;

    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      caption: txt,
      mimetype: contentType,
      fileName: 'imagen_mejorada.jpg'
    }, { quoted: m });

    await m.react("✅");
  } catch (e) {
    console.error("❌ Error en el ritual:", e);
    await m.react("✖️");
    m.reply("☠️ El ritual fue interrumpido por fuerzas desconocidas. El archivo puede estar corrupto o el vínculo no fue aceptado por los oráculos de Vreden.");
  }
};

handler.help = ["remini"];
handler.tags = ["tools"];
handler.command = ["remini", "hd", "enhance"];

export default handler;

// 🧙‍♂️ Mejora visual usando la API de Vreden
async function enhanceWithVreden(imageUrl) {
  const api = `https://api.vreden.my.id/api/artificial/hdr?url=${encodeURIComponent(imageUrl)}&pixel=4`;
  const res = await fetch(api);
  const json = await res.json();

  console.log("🧪 Respuesta de Vreden:", JSON.stringify(json, null, 2));

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