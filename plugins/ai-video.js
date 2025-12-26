import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❔', key: m.key } });
    return m.reply(`> Escribe el prompt para generar el video.\n\n*Ejemplo:* ${usedPrefix + command} Un gato bailando en una fiesta`);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://api-faa.my.id/faa/veo3?prompt=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.status || !data.check_url) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('No se pudo iniciar la generación.');
    }

    const checkUrl = data.check_url;
    let done = false;

    while (!done) {
      const statusRes = await fetch(checkUrl);
      const statusData = await statusRes.json();

      if (statusData.status && statusData.result && statusData.result.url) {
        done = true;
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        await conn.sendMessage(m.chat, { video: { url: statusData.result.url } }, { quoted: m });
      } else if (statusData.error) {
        done = true;
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        m.reply('La API devolvió un error en el procesamiento.');
      } else {
        await new Promise(r => setTimeout(r, 5000));
      }
    }

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('Ocurrió un error al generar el video.');
  }
};

handler.help = ['veo3'];
handler.tags = ['ia'];
handler.command = ['veo3'];

export default handler;