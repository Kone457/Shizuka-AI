import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ Ingresa un enlace de un video de *YouTube*');
    }

    if (!args[0].match(/youtube\.com|youtu\.be/)) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ El enlace no parece *válido*. Asegúrate de que sea de *YouTube*');
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${args[0]}&quality=128`);
    const json = await res.json();

    if (!json.status || !json.result?.download?.url) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el *audio*. Intenta con otro enlace.');
    }

    const audioUrl = json.result.download.url;
    const title = json.result.metadata?.title || 'audio';
    const caption = `𖣣ֶㅤ֯⌗ 🅨𝖙 🅜𝟑\n\n🎶 *Título:* ${title}\n🫗 *Enlace:* ${args[0]}`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mp4',
        fileName: `${title}.mp3`,
        caption
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar el audio.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['ytmp3'];
handler.tags = ['descargas'];
handler.command = ['ytmp3'];

export default handler;