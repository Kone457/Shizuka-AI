import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      return m.reply('> Ingresa un enlace de un video de Instagram');
    }

    if (!args[0].match(/instagram\.com\/(reel|p|tv)\//)) {
      return m.reply('> El enlace no parece *válido*. Asegúrate de que sea de *Instagram*');
    }

    const res = await fetch(`https://api.vreden.my.id/api/v1/download/instagram?url=${args[0]}`);
    const json = await res.json();

    if (!json.status || !json.result?.data?.[0]?.url) {
      return m.reply('> No se pudo obtener el *video*. Intenta con otro enlace.');
    }

    const videoUrl = json.result.data[0].url;

    const caption = `𖣣ֶㅤ֯⌗ 🅘𝖌 🅓ownload\n\n🫗 *Enlace:* ${args[0]}`;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: 'ig.mp4'
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al procesar el video.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['ig', 'instagram'];
handler.tags = ['descargas'];
handler.command = ['ig', 'instagram'];

export default handler;