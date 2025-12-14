import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ Ingresa un enlace de un video de *TikTok*');
    }

    if (!args[0].match(/tiktok\.com|vm\.tiktok\.com/)) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ El enlace no parece *válido*. Asegúrate de que sea de *TikTok*');
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const res = await fetch(`https://nexapi.onrender.com/download/tiktok?url=${encodeURIComponent(args[0])}`);
    const json = await res.json();

    if (!json.status || !json.result?.data?.play) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el *video*. Intenta con otro enlace.');
    }

    const data = json.result.data;

    const videoUrl = data.hdplay || data.play || data.wmplay;

    const caption = `𖣣ֶㅤ֯⌗ 🅣𝖐 🅓ownload
🎧 *Título:* ${data.title || 'Sin título'}
⏱️ *Duración:* ${data.duration || 'N/D'} seg
👤 *Autor:* ${data.author?.nickname || 'Desconocido'}
🫗 *Enlace:* ${args[0]}`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: 'tiktok.mp4',
        thumbnail: data.cover ? { url: data.cover } : null
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('Error TikTok:', error, 'URL:', args[0]);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar el video.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['tt', 'tiktok'];
handler.tags = ['descargas'];
handler.command = ['tt', 'tiktok'];

export default handler;