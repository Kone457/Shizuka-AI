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

    const res = await fetch(`https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(args[0])}&format=360`);
    const json = await res.json();

    if (!json.success || !json.result?.downloadUrl) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el *video*. Intenta con otro enlace.');
    }

    const videoUrl = json.result.downloadUrl;
    const title = json.result.title || 'video';
    const duration = json.result.duration || 'Desconocida';
    const quality = json.result.quality || '360p';
    const caption = `𖣣ֶㅤ֯⌗ 🅨𝖙 🅥ideo\n\n🎬 *Título:* ${title}\n⏱️ *Duración:* ${duration}\n📊 *Calidad:* ${quality}`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: `${title.replace(/[^\w\s]/gi, '')} (${quality}).mp4`
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar el video.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['ytmp4'];
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'mp4'];

export default handler;