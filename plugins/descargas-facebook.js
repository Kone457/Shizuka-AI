
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!global._processedMessages) global._processedMessages = new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  const thumbnailCard = 'https://qu.ax/phgPU.jpg';

  if (!text || !/(facebook\.com|fb\.watch)/.test(text)) {
    return await conn.sendMessage(
      m.chat,
      {
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
      },
      { quoted: m }
    );
  }

  try {
    await m.react('🧨');

    // 📡 Llamada a la API de Starlights
    const apiRes = await fetch(
      `https://api.starlights.uk/api/downloader/facebook?url=${encodeURIComponent(text)}`
    );
    const json = await apiRes.json();

    if (!json.status || !json.data?.result) throw new Error('No se pudo obtener el video');

    // Parseamos los resultados
    const videos = json.data.result.map(v => JSON.parse(v));

    // 🎚️ Selección ritual de resolución
    const chosen = videos.find(v => v.quality === 'alta') || videos[0];
    if (!chosen || !chosen.dl_url) throw new Error('No se encontró un video válido');

    const { quality, dl_url: videoUrl } = chosen;

    // 🖼️ Usamos la miniatura de la card por simplicidad
    let jpegThumbnail = null;
    try {
      jpegThumbnail = await conn.getBuffer(thumbnailCard);
    } catch (e) {
      // seguimos sin thumbnail si falla
    }

    if (jpegThumbnail) {
      await conn.sendMessage(
        m.chat,
        {
          image: jpegThumbnail,
          caption: '📸 Miniatura pequeña para tu contemplación ritual.'
        },
        { quoted: m }
      );
    }

    // 🎬 Entrega final: video reproducible
    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: `
🎞️ Resolución: ${quality}
📥 El archivo ha sido purificado y está listo para su contemplación ritual.
        `.trim(),
        jpegThumbnail
      },
      { quoted: m }
    );

    await m.react('✅');
  } catch (err) {
    console.error('Ritual fallido:', err);
    await conn.sendMessage(
      m.chat,
      { text: `❌ *Ritual interrumpido.*\n📛 Detalles: ${err.message}` },
      { quoted: m }
    );
    await m.react('⚠️');
  }
};

handler.command = ['fb', 'fbritual', 'shizukafb'];
export default handler;