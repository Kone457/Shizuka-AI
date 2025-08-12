// 🎬 Descargador ritual de Facebook por Shizuka
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 🛡️ Protección por ID único del mensaje
  global._processedMessages ??= new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  const thumbnailCard = 'https://qu.ax/phgPU.jpg'; // 🖼️ Tarjeta ceremonial
  const mainImage = 'https://d.uguu.se/fUzMERCs.jpg';     // 🎭 Imagen escénica

  if (!text || !text.includes('facebook.com')) {
    return await conn.sendMessage(m.chat, {
      text: `📥 *Proporciona un enlace válido de Facebook para invocar el video.*\nEjemplo:\n${usedPrefix + command} https://www.facebook.com/share/v/abc123`,
      footer: '🔗 Ritual de descarga por Shizuka',
      contextInfo: {
        externalAdReply: {
          title: 'Invocación desde Facebook',
          body: 'Shizuka transforma enlaces en reliquias visuales',
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

    const videoList = json?.[0] || json.objects?.[0]?.content;
    const parsed = typeof videoList === 'string' ? JSON.parse(videoList) : videoList;
    const video720 = parsed.find(v => v.resolution.includes('720p'));

    if (!video720?.url) {
      return m.reply('❌ No se encontró video en 720p para este enlace.');
    }

    const videoUrl = video720.url;
    const thumbnailUrl = video720.thumbnail;

    const caption = `
🎬 *Resolución:* ${video720.resolution}
📦 *Formato:* Video MP4
🔗 *Origen:* Facebook
`.trim();

    // 🖼️ Mensaje 1: presentación escénica
    await conn.sendMessage(m.chat, {
      image: { url: mainImage },
      caption,
      footer: '📥 Video ritualizado por Shizuka',
      contextInfo: {
        externalAdReply: {
          title: 'Video en 720p listo para contemplación',
          body: 'Shizuka ha purificado el archivo',
          thumbnailUrl: thumbnailCard,
          sourceUrl: videoUrl
        }
      }
    }, { quoted: m });

    // 🎥 Mensaje 2: entrega del video como mensaje reproducible
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: '📥 *Shizuka ha completado la ceremonia.*\n\n🎬 El archivo está listo para su contemplación ritual.',
      jpegThumbnail: await conn.getBuffer(thumbnailUrl)
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    m.reply(`❌ Error en el ritual.\n📛 Detalles: ${error.message}`);
    m.react('⚠️');
  }
};

handler.command = ['fb', 'fbritual', 'shizukafb'];
export default handler;