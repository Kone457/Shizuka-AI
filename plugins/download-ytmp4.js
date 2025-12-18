import fetch from 'node-fetch';

const ytdl = {
    async get(video) {
        try {
            const api = 'https://api.vidfly.ai/api/media/youtube/download';
            const headers = {
                'Content-Type': 'application/json',
                'X-App-Name': 'vidfly-web',
                'X-App-Version': '1.0.0',
                'User-Agent': 'Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0',
                'Referer': 'https://vidfly.ai/es/youtube-video-downloader/'
            };

            const response = await fetch(`${api}?url=${encodeURIComponent(video)}`, { headers });
            const data = await response.json();

            if (data.code !== 0) {
                return { status: false, creador: "sistema", result: null };
            }

            const info = data.data;
            const downloads = [];

            for (const item of info.items) {
                downloads.push({
                    type: item.type,
                    link: item.url,
                    quality: item.label,
                    format: item.type.includes('mp4') ? 'mp4' : 
                           item.type.includes('webm') ? 'webm' : 
                           item.type.includes('m4a') ? 'm4a' : 
                           item.type.includes('opus') ? 'opus' : item.type
                });
            }

            return {
                status: true,
                creador: "sistema",
                result: {
                    title: info.title,
                    img: info.cover,
                    dl: downloads
                }
            };
        } catch (error) {
            return { status: false, creador: "sistema", result: null };
        }
    }
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply(`⚠️ Ingresa un enlace de YouTube\n\nEjemplo: *${usedPrefix + command} https://youtu.be/ejemplo*`);
    }

    if (!args[0].match(/youtube\.com|youtu\.be/)) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ Enlace no válido');
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const response = await ytdl.get(args[0]);
    
    if (!response.status || !response.result || !response.result.dl || response.result.dl.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el video');
    }

    const videoData = response.result;
    
    // Filtrar solo videos con audio (mp4 que contengan VIDEO_WITH_AUDIO o mp4 normal)
    const videoFormats = videoData.dl.filter(item => {
      // Incluir formatos de video con audio
      return (
        (item.type.includes('VIDEO_WITH_AUDIO') && item.type.includes('mp4')) ||
        (item.type.includes('VIDEO') && (item.type.includes('mp4') || item.format === 'mp4')) ||
        (item.format === 'mp4' && !item.type.includes('AUDIO'))
      );
    });

    if (videoFormats.length === 0) {
      // Si no hay mp4 con audio, buscar cualquier mp4
      const anyMp4 = videoData.dl.find(item => 
        item.type.includes('mp4') || item.format === 'mp4'
      );
      
      if (!anyMp4) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        
        let availableFormats = videoData.dl.map(item => 
          `• ${item.quality || 'Sin calidad'} - ${item.format || item.type}`
        ).join('\n');
        
        return m.reply(`⚠️ No se encontró formato compatible\n\n📋 Formatos disponibles:\n${availableFormats}`);
      }
      
      videoFormats.push(anyMp4);
    }

    // Ordenar por calidad (de mayor a menor)
    const qualityOrder = ['1080p', '720p', '480p', '360p', '240p', '144p'];
    videoFormats.sort((a, b) => {
      const aIndex = qualityOrder.findIndex(q => a.quality.includes(q));
      const bIndex = qualityOrder.findIndex(q => b.quality.includes(q));
      return aIndex - bIndex; // Menor índice = mejor calidad
    });

    // Tomar el mejor formato disponible
    const selectedVideo = videoFormats[0];
    
    const videoUrl = selectedVideo.link;
    const title = videoData.title || 'Video YouTube';
    const quality = selectedVideo.quality || 'Desconocida';
    const hasAudio = selectedVideo.type.includes('VIDEO_WITH_AUDIO') ? 'Con audio' : 'Solo video';
    
    const caption = `🎬 *YouTube Video*\n
📌 *Título:* ${title}
📊 *Calidad:* ${quality}
🔊 *Audio:* ${hasAudio}
🔗 *Formato:* MP4
`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: caption,
        mimetype: 'video/mp4',
        fileName: `${title.substring(0, 100).replace(/[^\w\s]/gi, '')}_${quality}.mp4`
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    return m.reply('💥 Error interno');
  }
};

handler.help = ['ytmp4 <url>'];
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'mp4', 'ytv'];
handler.limit = true;

export default handler;