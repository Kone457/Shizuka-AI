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

    // Nueva API
    const res = await fetch(`https://api.starlights.uk/api/downloader/facebook?url=${encodeURIComponent(args[0])}`);
    const json = await res.json();

    if (!json.status || !json.data?.result?.length) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el video. Intenta con otro enlace.');
    }

    // Parseamos los resultados
    const results = json.data.result.map(r => JSON.parse(r));
    const hd = results.find(r => r.quality === 'alta');
    const sd = results.find(r => r.quality === 'baja');

    const videoUrl = hd?.dl_url || sd?.dl_url;
    if (!videoUrl) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se encontró un enlace válido de descarga.');
    }

    const caption = `𖣣ֶㅤ֯⌗ 🅕𝖡 🅓ownload
    
🎬 Calidad: ${hd ? 'Alta' : 'Baja'}
🫗 Enlace: ${args[0]}`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: hd ? 'fbhd.mp4' : 'fbsd.mp4'
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