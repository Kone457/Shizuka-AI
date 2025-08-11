// 🎬 Descargador de Facebook por Delirius API

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 🛡️ Protección por ID único del mensaje
  global._processedMessages ??= new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  const thumbnailCard = 'https://qu.ax/AEkvz.jpg';
  const mainImage = 'https://qu.ax/phgPU.jpg';

  // 🎯 Validación del enlace
  if (!text || (!text.includes('facebook.com') && !text.includes('fb.watch'))) {
    return await conn.sendMessage(m.chat, {
      text: `🎥 *Proporciona un enlace válido de Facebook para descargar.*\n\n📌 Ejemplo:\n${usedPrefix + command} https://fb.watch/abc123xyz/`,
      footer: '🔗 Facebook Downloader por Delirius API',
      contextInfo: {
        externalAdReply: {
          title: 'Descarga directa desde Facebook',
          body: 'Convierte enlaces en videos descargables',
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

    const title = json.title || 'Video de Facebook';
    const hd = json.urls?.[0]?.hd;
    const sd = json.urls?.[1]?.sd;
    const videoUrl = hd || sd;

    if (!videoUrl) {
      return m.reply('❌ No se encontró una resolución adecuada para descargar.');
    }

    const caption = `
🎬 *Título:* ${title}
📥 *Resolución:* ${hd ? 'HD' : 'SD'}
🔗 *Fuente:* Facebook
`.trim();

    // 🖼️ Mensaje 1: visualización escénica
    await conn.sendMessage(m.chat, {
      image: { url: mainImage },
      caption,
      footer: '🎭 Video obtenido vía Delirius API',
      contextInfo: {
        externalAdReply: {
          title,
          body: hd ? 'Alta definición disponible' : 'Resolución estándar',
          thumbnailUrl: thumbnailCard,
          sourceUrl: text
        }
      }
    }, { quoted: m });

    // 🎥 Mensaje 2: envío del video
    await conn.sendMessage(m.chat, {
      video: {
        url: videoUrl,
        fileName: 'facebook.mp4',
        mimetype: 'video/mp4'
      },
      caption: '🎬 Aquí tienes tu video descargado desde Facebook.'
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    await m.reply(`❌ Error al procesar el enlace.\n📛 Detalles: ${error.message}`);
    await m.react('⚠️');
  }
};

handler.command = ['fb', 'facebook'];
export default handler;