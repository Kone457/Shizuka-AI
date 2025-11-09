import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      return m.reply('> Ingresa un enlace de un video de YouTube');
    }

    if (!args[0].match(/youtube\.com|youtu\.be/)) {
      return m.reply('> El enlace no parece *válido*. Asegúrate de que sea de *YouTube*');
    }

    const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${args[0]}&quality=360`);
    const json = await res.json();

    if (!json.status || !json.result?.download?.url) {
      return m.reply('> No se pudo obtener el *video*. Intenta con otro enlace.');
    }

    const videoUrl = json.result.download.url;
    const title = json.result.metadata?.title || 'video';
    const caption = `𖣣ֶㅤ֯⌗ 🅨𝖙 🅓ownload\n\n🎬 *Título:* ${title}\n🫗 *Enlace:* ${args[0]}`;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: `${title} (360p).mp4`
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al procesar el video.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['ytmp4'];
handler.tags = ['descargas'];
handler.command = ['ytmp4'];

export default handler;