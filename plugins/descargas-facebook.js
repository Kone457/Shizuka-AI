import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  global._processedMessages ??= new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  const thumbnailCard = 'https://qu.ax/phgPU.jpg';
  const mainImage = 'https://d.uguu.se/fUzMERCs.jpg';

  if (
    !text ||
    (!text.includes('fb.watch') &&
     !text.includes('facebook.com') &&
     !text.match(/https?:\/\/(www\.)?facebook\.com\/.+/))
  ) {
    return await conn.sendMessage(m.chat, {
      text: `🎬 Shizuka necesita un enlace válido de Facebook para invocar la descarga.\n\n📌 Ejemplo:\n${usedPrefix + command} https://fb.watch/abc123xyz/`,
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

  await m.react('🌀');

  try {
    const apiUrl = `https://api.dorratz.com/fbvideo?url=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl);
    const videos = res.data;

    if (!Array.isArray(videos) || videos.length === 0) {
      await m.react('❌');
      return m.reply('⚠️ No se pudo encontrar un video en el enlace proporcionado. Intenta con otro.');
    }

    const preferred = videos.find(v => v.resolution.includes('1080p')) ||
                      videos.find(v => v.resolution.includes('720p')) ||
                      videos[0];

    const { resolution, thumbnail, url } = preferred;
    const title = 'Escena invocada desde Facebook';

    const caption = `
🎞️ Resolución: ${resolution}
📺 Calidad: ${resolution.includes('1080p') ? 'Ultra HD' : resolution.includes('720p') ? 'HD' : 'SD'}
🧭 Origen: Facebook
🧙 Invocado por: Shizuka
`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: mainImage },
      caption,
      footer: '🎭 Escena ritual vía Delirius API',
      contextInfo: {
        externalAdReply: {
          title: title,
          body: resolution,
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // 🎥 Envío como video en vez de documento
    await conn.sendMessage(m.chat, {
      video: {
        url,
        fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
        mimetype: 'video/mp4'
      },
      caption: '📥 Shizuka ha completado la descarga ritual'
    }, { quoted: m });

    await m.react('✅');

  } catch (error) {
    await m.react('❌');

    let tipo = 'Error inesperado';
    let mensaje = error.message;

    if (error.response) {
      tipo = `Error HTTP ${error.response.status}`;
      mensaje = `La API respondió con un error: ${error.response.statusText}`;
    } else if (error.request) {
      tipo = 'Error de conexión';
      mensaje = 'No se pudo conectar con el servidor de la API. Revisa tu conexión a internet.';
    }

    await conn.sendMessage(m.chat, {
      text: `❌ Shizuka detectó un error al procesar el enlace.\n📛 Detalles: ${mensaje}\n🧩 Tipo: ${tipo}`
    }, { quoted: m });

    console.error(`[FB-DL] Error capturado: ${tipo} → ${error.message}`);
  }
};

handler.command = ['fb', 'facebook'];
handler.help = ['fb <url>'];
handler.tags = ['download'];

export default handler;