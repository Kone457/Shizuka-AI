import { fbdl, fbdl2 } from 'ruhend-scraper'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!global._processedMessages) global._processedMessages = new Set();
  if (global._processedMessages.has(m.key.id)) return;
  global._processedMessages.add(m.key.id);

  if (!text || !/(facebook\.com|fb\.watch|fb\.gg)/.test(text)) {
    return await conn.sendMessage(
      m.chat,
      { text: `《✧》 Proporciona un enlace válido de Facebook.` },
      { quoted: m }
    );
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    let result = await fbdl(text)
    if (!result || !result.status || !result.data?.length) {
      result = await fbdl2(text)
    }

    if (!result || !result.status || !result.data?.length) {
      throw new Error('No se pudo descargar el contenido de Facebook.')
    }

    const media = result.data[0]
    const dlUrl = media.url

    await conn.sendMessage(
      m.chat,
      {
        video: { url: dlUrl },
        caption: `*✿ Aqui tienes...*`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    
  } catch (err) {
    console.error('❏ Error en el plugin de Facebook:', err);
    await conn.sendMessage(
      m.chat,
      { text: `❏ Error al procesar la solicitud.\n❏ Detalles: ${err.message}` },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['facebook'];
handler.tags = ['descargas'];
handler.command = ['fb', 'facebook'];
handler.group = true;

export default handler;
