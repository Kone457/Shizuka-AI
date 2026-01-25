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

    
    const apiUrl = `https://nexevo.onrender.com/download/y?url=${encodeURIComponent(args[0])}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.result?.url) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el *audio*. Intenta con otro enlace.');
    }

    const audioUrl = json.result.url;
    const title = json.result.info?.title || 'Audio de YouTube';
    const duration = json.result.info?.duration || 'Desconocida';
    const quality = `${json.result.quality || 128} kbps`;
    
    
    const cleanTitle = title.replace(/[^\w\s]/gi, '').substring(0, 50) || 'audio_youtube';
    
    const caption = `𖣣ֶㅤ֯⌗ 🅨𝖙 🅜𝟑\n\n🎶 *Título:* ${title}\n⏱️ *Duración:* ${duration}\n📊 *Calidad:* ${quality}\n🔄 *Formato:* MP3`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${cleanTitle}.mp3`,
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

handler.help = ['ytmp3', 'ytaudio'];
handler.tags = ['descargas'];
handler.command = ['ytmp3', 'ytaudio', 'mp3'];

export default handler;