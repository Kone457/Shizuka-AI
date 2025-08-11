// 🎭 Plugin Shizuka: Descargador de Facebook Watch por Delirius API

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 🛡️ Protección escénica por ID único
  global._processedMessages ??= new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  const thumbnailCard = 'https://qu.ax/phgPU.jpg'; // Miniatura ritual
  const mainImage = 'https://qu.ax/AEkvz.jpg';     // Imagen escénica principal

  if (!text || !text.includes('fb.watch')) {
    return await conn.sendMessage(m.chat, {
      text: `🎬 *Shizuka necesita un enlace válido de Facebook Watch para invocar la descarga.*\n\n📌 Ejemplo:\n${usedPrefix + command} https://fb.watch/abc123xyz/`,
      footer: '🔗 Ritual de descarga por Delirius API',
      contextInfo: {
        externalAdReply: {
          title: 'Shizuka invoca escenas desde Facebook',
          body: 'Transforma enlaces en descargas teatrales',
          thumbnailUrl: thumbnailCard,
          sourceUrl: 'https://facebook.com'
        }
      }
    }, { quoted: m });
  }

  try {
    const api = `https://delirius-apiofc.vercel.app/download/facebook?url=${encodeURIComponent(text)}`;
    const res = await fetch(api);
    const json = await res.json();

    const { title, isHdAvailable, urls } = json;
    const videoUrl = isHdAvailable ? urls[0].hd : urls[1].sd;

    const caption = `
🎞️ *Título:* ${title}
📺 *Calidad:* ${isHdAvailable ? 'Alta definición (HD)' : 'Definición estándar (SD)'}
🧭 *Origen:* Facebook Watch
🧙 *Invocado por:* Shizuka
`.trim();

    // 🖼️ Escena 1: visualización emocional
    await conn.sendMessage(m.chat, {
      image: { url: mainImage },
      caption,
      footer: '🎭 Escena ritual vía Delirius API',
      contextInfo: {
        externalAdReply: {
          title: title,
          body: isHdAvailable ? 'HD disponible' : 'SD disponible',
          thumbnailUrl: thumbnailCard,
          sourceUrl: videoUrl
        }
      }
    }, { quoted: m });

    // 📥 Escena 2: entrega del archivo como documento MP4
    await conn.sendMessage(m.chat, {
      document: {
        url: videoUrl,
        fileName: `${title}.mp4`,
        mimetype: 'video/mp4'
      },
      caption: '📥 Shizuka ha completado la descarga ritual'
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    await m.reply(`❌ *Shizuka detectó un error al procesar el enlace.*\n📛 *Detalles:* ${error.message}`);
    await m.react('⚠️'); // ✅ Reacción directa sin variable emoji
  }
};

handler.command = ['fb'];
export default handler;