import fetch from 'node-fetch';

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
      text: `🎬 *Shizuka necesita un enlace válido de Facebook para invocar la descarga.*\n\n📌 Ejemplo:\n${usedPrefix + command} https://fb.watch/abc123xyz/`,
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
    const api = `https://api.dorratz.com/fbvideo?url=${encodeURIComponent(text)}`;
    const res = await fetch(api);
    const json = await res.json();

    if (!Array.isArray(json) || json.length === 0) throw new Error('Respuesta vacía o inválida');

    // 🎚️ Selección ritual: prioriza 1080p, luego 720p, luego el primero disponible
    const preferred = json.find(v => v.resolution.includes('1080p')) ||
                      json.find(v => v.resolution.includes('720p')) ||
                      json[0];

    const { resolution, thumbnail, url } = preferred;
    const title = 'Escena invocada desde Facebook'; // La API no da título, así que lo ritualizamos

    const caption = `
🎞️ *Resolución:* ${resolution}
📺 *Calidad:* ${resolution.includes('1080p') ? 'Ultra HD' : resolution.includes('720p') ? 'HD' : 'SD'}
🧭 *Origen:* Facebook
🧙 *Invocado por:* Shizuka
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
          sourceUrl: url
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      document: {
        url,
        fileName: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
        mimetype: 'video/mp4'
      },
      caption: '📥 Shizuka ha completado la descarga ritual'
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    await m.reply(`❌ *Shizuka detectó un error al procesar el enlace.*\n📛 *Detalles:* ${error.message}`);
    await m.react('⚠️');
  }
};

handler.command = ['fb'];
export default handler;