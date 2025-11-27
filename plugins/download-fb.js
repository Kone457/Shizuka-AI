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

    const res = await fetch(`https://api.dorratz.com/fbvideo?url=${encodeURIComponent(args[0])}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const videoUrl = json?.url;
    const thumbUrl = json?.thumbnail;
    const resolution = json?.resolution;

    if (!videoUrl) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el video. Intenta con otro enlace.');
    }

    const caption = `𖣣ֶㅤ֯⌗ 🅕𝖡 🅓ownload\n\n🎬 Resolución: ${resolution}\n🫗 Enlace: ${args[0]}`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: resolution?.includes('HD') ? 'fbhd.mp4' : 'fbsd.mp4',
        thumbnail: thumbUrl ? await (await fetch(thumbUrl)).buffer() : null
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('[FB-Dorratz] Error:', error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 Error al procesar el video. Intenta nuevamente más tarde.');
  }
};

handler.help = ['fb', 'facebook'];
handler.tags = ['descargas'];
handler.command = ['fb', 'facebook'];

export default handler;