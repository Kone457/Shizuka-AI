import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ Ingresa un enlace de un video de Facebook');
    }

    if (!args[0].match(/facebook\.com|fb\.watch|video\.fb\.com/)) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ El enlace no parece válido. Asegúrate de que sea de Facebook');
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await fetch(https://sylphy.xyz/download/facebook?url=${args[0]});
    const json = await res.json();

    if (!json.status || (!json.result?.sd && !json.result?.hd)) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el video. Intenta con otro enlace.');
    }

    const videoUrl = json.result.hd || json.result.sd;
    const caption = 𖣣ֶㅤ֯⌗ 🅕𝖡 🅓ownload\n\n🎬 Título: ${json.result.title}\n🕒 Duración: ${json.result.duration}\n🫗 Enlace: ${args[0]};

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: json.result.hd ? 'fbhd.mp4' : 'fbsd.mp4',
        thumbnail: json.result.thumb ? await (await fetch(json.result.thumb)).buffer() : null
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 Error al procesar el video. Intenta nuevamente más tarde.');
  }
};

handler.help = ['fb', 'facebook'];
handler.tags = ['descargas'];
handler.command = ['fb', 'facebook'];

export default handler;