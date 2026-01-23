import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ Ingresa un enlace de *Instagram*');
    }

    if (!args[0].match(/instagram\.com/)) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*');
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://nexevo-api.vercel.app/download/instagram?url=${encodeURIComponent(args[0])}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.result?.dl) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el *video*. Intenta con otro enlace.');
    }

    const videoUrl = json.result.dl;

    const caption = `𖣣ֶㅤ֯⌗ 🅘🅖 🅥🅘🅓🅔🅞

📥 *Descarga de Instagram*
🎞️ *Formato:* MP4
🔗 *Fuente:* Instagram`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar el video.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['ig2'];
handler.tags = ['descargas'];
handler.command = ['ig2'];

export default handler;