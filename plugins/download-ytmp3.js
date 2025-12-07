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

    const res = await fetch(`https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(args[0])}&format=mp3`);
    const json = await res.json();

    if (!json.success || !json.result?.downloadUrl) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el *audio*. Intenta con otro enlace.');
    }

    const audioUrl = json.result.downloadUrl;
    const title = json.result.title || 'audio';
    const duration = json.result.duration || 'Desconocida';
    const quality = json.result.quality || '128 kbps';
    const caption = `𖣣ֶㅤ֯⌗ 🅨𝖙 🅜𝟑\n\n🎶 *Título:* ${title}\n⏱️ *Duración:* ${duration}\n📊 *Calidad:* ${quality}`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
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
handler.command = ['ytmp3', 'mp3'];

export default handler;