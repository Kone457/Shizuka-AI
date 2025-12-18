import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply(`⚠️ *Ingresa un enlace de YouTube*\nEjemplo: ${usedPrefix + command} https://youtu.be/...`);
    }

    if (!args[0].match(/(youtube\.com\/watch\?v=|youtu\.be\/)/)) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ *Enlace no válido*\nAsegúrate de que sea un enlace directo de YouTube');
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    let videoId = '';
    if (args[0].includes('youtu.be/')) {
      videoId = args[0].split('youtu.be/')[1].split('?')[0];
    } else if (args[0].includes('youtube.com/watch?v=')) {
      videoId = args[0].split('v=')[1].split('&')[0];
    }

    if (!videoId) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ No se pudo extraer el ID del video');
    }

    let videoData = null;
    let apiSource = '';
    
    try {
      const res1 = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${encodeURIComponent(args[0])}&quality=360`);
      const json1 = await res1.json();
      
      if (json1.status && json1.result?.download?.url) {
        videoData = {
          url: json1.result.download.url,
          title: json1.result.metadata?.title || 'Video de YouTube',
          duration: json1.result.metadata?.duration?.timestamp || 'Desconocida',
          quality: json1.result.download.quality || '360p',
          source: 'API 1'
        };
        apiSource = 'vreden';
      }
    } catch (error) {}

    if (!videoData) {
      try {
        const res2 = await fetch(`https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(args[0])}&format=360`);
        const json2 = await res2.json();
        
        if (json2.success && json2.result?.downloadUrl) {
          videoData = {
            url: json2.result.downloadUrl,
            title: json2.result.title || 'Video de YouTube',
            duration: json2.result.duration || 'Desconocida',
            quality: json2.result.quality || '360p',
            source: 'API 2'
          };
          apiSource = 'nekolabs';
        }
      } catch (error) {}
    }

    if (!videoData) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ *Error al obtener el video*\nAmbas APIs están fallando. Intenta más tarde.');
    }

    const caption = `
╭─「 🅨𝖙 🅥ideo 」
│ ✨ *Título:* ${videoData.title}
│ ⏱️ *Duración:* ${videoData.duration}
│ 📊 *Calidad:* ${videoData.quality}
│ 🔧 *Fuente:* ${apiSource}
╰───────────────`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    const cleanTitle = videoData.title
      .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ.,!?\-]/gi, '')
      .substring(0, 100);

    await conn.sendMessage(
      m.chat,
      {
        video: { 
          url: videoData.url 
        },
        caption: caption,
        mimetype: 'video/mp4',
        fileName: `${cleanTitle} (${videoData.quality}).mp4`
      },
      { 
        quoted: m,
        ephemeralExpiration: 86400
      }
    );

  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    await m.reply(`💥 *Error*\n${error.message}`);
  }
};

handler.help = ['ytmp4 <url>', 'mp4 <url>'];
handler.tags = ['descargas', 'media'];
handler.command = /^(ytmp4|ytv|mp4|videoyt)$/i;
handler.limit = true;
handler.premium = false;
handler.register = true;

export default handler;