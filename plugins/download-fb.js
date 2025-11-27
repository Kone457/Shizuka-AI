import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!global._processedMessages) global._processedMessages = new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  if (!text || !/(facebook\.com|fb\.watch)/.test(text)) {
    return await conn.sendMessage(
      m.chat,
      {
        text: `⬛ Proporciona un enlace válido de Facebook.\nEjemplo:\n${usedPrefix + command} https://www.facebook.com/share/v/abc123`
      },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } });

    const apiRes = await fetch(
      `https://api.starlights.uk/api/downloader/facebook?url=${encodeURIComponent(text)}`
    );
    const json = await apiRes.json();

    if (!json.status || !json.data?.result) throw new Error('No se pudo obtener el video');

    const videos = json.data.result.map(v => JSON.parse(v));
    const chosen = videos.find(v => v.quality === 'alta') || videos[0];
    if (!chosen || !chosen.dl_url) throw new Error('No se encontró un video válido');

    const { quality, dl_url: videoUrl } = chosen;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: `⬛ Calidad: ${quality}\n⬛ Descarga completada.`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });
  } catch (err) {
    console.error('Error:', err);
    await conn.sendMessage(
      m.chat,
      { text: `⬛ Error.\n⬛ Detalles: ${err.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
  }
};

handler.help = ['facebook *<url>*'];
handler.tags = ['descargas'];
handler.command = ['fb', 'facebook'];
export default handler;