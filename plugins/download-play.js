/* import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('⚠️ Ingresa el nombre de la música que deseas buscar.');
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

    const searchRes = await fetch(`https://sky-api-ashy.vercel.app/search/youtube?q=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.status || !searchJson.result?.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ No se encontraron resultados.');
    }

    const video = searchJson.result[0];
    const { title, channel, duration, imageUrl, link } = video;

    const info = `
˚∩　ׅ　🅨𝗈𝗎𝖳𝗎𝖻𝖾 🅟𝗅𝖺𝗒　ׄᰙ　ׅ

> 🕸̴𖫲᮫ִ۫𝆬  Descargando › *${title}*

𖣣ֶㅤ֯⌗ 🐤 ׄ ⬭ Canal › *${channel}*
𖣣ֶㅤ֯⌗ 🌿 ׄ ⬭ Duración › *${duration}*
𖣣ֶㅤ֯⌗ 🥙 ׄ ⬭ Enlace › *${link}*
`.trim();

    const thumb = await (await fetch(imageUrl)).arrayBuffer();
    await conn.sendMessage(m.chat, { image: Buffer.from(thumb), caption: info }, { quoted: m });

    if (command === 'play') {
      await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });

      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${link}&quality=128`);
      const json = await res.json();

      if (!json.status || !json.result?.download?.url) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply('⚠️ No se pudo obtener el *audio*. Intenta con otro enlace.');
      }

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: json.result.download.url },
          fileName: `${title}.mp3`,
          mimetype: 'audio/mpeg',
          ptt: true
        },
        { quoted: m }
      );
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }

    if (command === 'play2') {
      await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${link}&quality=360`);
      const json = await res.json();

      if (!json.status || !json.result?.download?.url) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply('⚠️ No se pudo obtener el *video*. Intenta con otro enlace.');
      }

      await conn.sendMessage(
        m.chat,
        {
          video: { url: json.result.download.url },
          fileName: `${title} (360p).mp4`,
          mimetype: 'video/mp4',
          caption: info
        },
        { quoted: m }
      );
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }

  } catch (e) {
    console.error('[play] Error:', e);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar tu solicitud.*');
  }
};

handler.command = ['play', 'play2'];
handler.tags = ['descargas'];
handler.help = ['play', 'play2'];

export default handler;
*/