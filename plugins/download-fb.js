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
      `https://api.vreden.my.id/api/v1/download/facebook?url=${encodeURIComponent(text)}`
    );
    const json = await apiRes.json();

    
    if (!json.status || !json.result?.download?.hd) {
      throw new Error('No se pudo obtener el video o no hay enlace HD disponible');
    }

    const { title, thumbnail, durasi, download } = json.result;
    const videoUrl = download.hd; 

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: `📹 *${title || 'Video de Facebook'}*\n🕒 Duración: ${durasi || 'Desconocida'}\n⬛ Descarga completada.`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });
  } catch (err) {
    console.error('Error en el plugin de Facebook:', err);
    await conn.sendMessage(
      m.chat,
      { text: `⬛ Error al procesar la solicitud.\n⬛ Detalles: ${err.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
  }
};

handler.help = ['facebook *<url>*'];
handler.tags = ['descargas'];
handler.command = ['fb', 'facebook'];
export default handler;