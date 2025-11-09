import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return m.reply(
        `> Ingresa un enlace de un video de Facebook`
      );
    }

    if (!args[0].match(/facebook\.com|fb\.watch|video\.fb\.com/)) {
      return m.reply('> El enlace no parece *válido*. Asegúrate de que sea de *Facebook*');
    }

    // await conn.sendMessage(m.chat, { text: '⏳ *Procesando video...*' }, { quoted: m });

    const res = await fetch(`https://api.vreden.my.id/api/v1/download/facebook?url=${args[0]}`);
    const json = await res.json();

    if (!json.status || !json.result?.download?.hd) {
      return m.reply('> No se pudo obtener el *video*. Intenta con otro enlace.');
    }

    const videoUrl = json.result.download.hd;

    const caption = `𖣣ֶㅤ֯⌗ 🅕𝖡 🅓ownload\n\n🫗 *Enlace:* ${args[0]}`;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: 'fb.mp4'
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('> *Error al procesar el video.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['fb', 'facebook'];
handler.tags = ['descargas'];
handler.command = ['fb', 'facebook'];

export default handler;