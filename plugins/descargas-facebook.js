// 🎬 Descargador ritual de Facebook por Shizuka
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 🛡️ Prevención de mensajes duplicados
  global._processedMessages ??= new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  const thumbnailCard = 'https://qu.ax/phgPU.jpg';
  const mainImage    = 'https://qu.ax/AEkvz.jpg';

  if (!text || !/(facebook\.com|fb\.watch)/.test(text)) {
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
    await m.react('🌀');

    // 📡 Llamada a la API de Dorratz
    const apiRes = await fetch(`https://api.dorratz.com/fbvideo?url=${encodeURIComponent(text)}`);
    let videos  = await apiRes.json();

    // Si viene con wrapper { objects: [...] }
    if (!Array.isArray(videos) && videos.objects) {
      videos = JSON.parse(videos.objects[0].content);
    }

    // 🎚️ Selección ritual de resolución
    const chosen = videos.find(v => v.resolution.includes('1080')) ||
                   videos.find(v => v.resolution.includes('720'))  ||
                   videos[0];

    if (!chosen?.url) throw new Error('No se encontró un video válido');

    const { resolution, thumbnail: thumbUrl, url: videoUrl } = chosen;

    // 🔮 Mensaje de preludio ceremonial
    await conn.sendMessage(m.chat, {
      text: `🔄 *Shizuka está invocando el video en ${resolution}...*`,
    }, { quoted: m });

    // 🖼️ Buffer de la miniatura
    let jpegThumbnail = null;
    try {
      jpegThumbnail = await conn.getBuffer(thumbUrl);
    } catch {}

    // 🎬 Entrega final: video reproducible
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `
🎞️ Resolución: ${resolution}
📥 El archivo ha sido purificado y está listo para su contemplación ritual.
      `.trim(),
      jpegThumbnail
    }, { quoted: m });

    await m.react('✅');
  } catch (err) {
    console.error('Ritual fallido:', err);
    await conn.sendMessage(m.chat, {
      text: `❌ *Ritual interrumpido.*\n📛 Detalles: ${err.message}`
    }, { quoted: m });
    await m.react('⚠️');
  }
};

handler.command = ['fb','fbritual','shizukafb'];
export default handler;