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
                    // Extraer el formato real del string
                    format: item.type.includes('mp4') || item.type.includes('webm') || item.type.includes('m4a') || item.type.includes('opus') 
                        ? item.type.split(' ').pop() 
                        : item.type
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
    
    // Función para extraer número de calidad
    const extractQualityNumber = (qualityString) => {
      const match = qualityString.match(/(\d+)p/);
      return match ? parseInt(match[1]) : 0;
    };
    
    // Filtrar solo videos con audio (mp4) en orden de calidad
    const videoWithAudio = videoData.dl.filter(item => 
      item.type === 'VIDEO_WITH_AUDIO' || 
      (item.type.includes('VIDEO') && (item.format === 'mp4' || item.quality.includes('mp4')))
    );
    
    // Ordenar por calidad (mayor a menor)
    videoWithAudio.sort((a, b) => {
      const qualityA = extractQualityNumber(a.quality);
      const qualityB = extractQualityNumber(b.quality);
      return qualityB - qualityA;
    });
    
    // Buscar específicamente 720p con audio
    let selectedVideo = videoWithAudio.find(item => 
      item.quality.includes('720p') && 
      (item.type === 'VIDEO_WITH_AUDIO' || item.format === 'mp4')
    );
    
    // Si no hay 720p, buscar 360p con audio
    if (!selectedVideo) {
      selectedVideo = videoWithAudio.find(item => 
        item.quality.includes('360p') && 
        (item.type === 'VIDEO_WITH_AUDIO' || item.format === 'mp4')
      );
    }
    
    // Si aún no hay, tomar el mejor video con audio disponible
    if (!selectedVideo && videoWithAudio.length > 0) {
      selectedVideo = videoWithAudio[0];
    }
    
    // Si no hay videos con audio, buscar cualquier video mp4
    if (!selectedVideo) {
      const anyMp4 = videoData.dl.find(item => 
        item.format === 'mp4' || 
        item.quality.includes('mp4') ||
        item.type.includes('mp4')
      );
      selectedVideo = anyMp4;
    }
    
    if (!selectedVideo) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      
      let availableFormats = videoData.dl.map(item => 
        `• ${item.type} - ${item.quality || item.format || 'Sin calidad'}`
      ).join('\n');
      
      return m.reply(`⚠️ No se encontró formato MP4 compatible\n\n📋 Formatos disponibles:\n${availableFormats}`);
    }

    const videoUrl = selectedVideo.link;
    const title = videoData.title || 'Video YouTube';
    const quality = selectedVideo.quality || selectedVideo.format || 'Desconocida';
    const formatType = selectedVideo.type;
    
    // Determinar mensaje según calidad
    let qualityMsg = '';
    if (quality.includes('720p') || quality.includes('720')) {
      qualityMsg = '✅ Descargado en 720p';
    } else if (quality.includes('360p') || quality.includes('360')) {
      qualityMsg = quality.includes('720p') ? '✅ Descargado en 720p' : 'ℹ️ Descargado en 360p (720p no disponible)';
    } else {
      qualityMsg = `⚠️ Descargado en calidad disponible: ${quality}`;
    }
    
    const caption = `🎬 *YouTube Video*\n
📌 *Título:* ${title}
📊 *Calidad:* ${quality}
🔗 *Formato:* ${formatType === 'VIDEO_WITH_AUDIO' ? 'MP4 con Audio' : formatType || 'MP4'}

${qualityMsg}
`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: caption,
        mimetype: 'video/mp4',
        fileName: `${title.substring(0, 100).replace(/[^\w\s]/gi, '')}.mp4`
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
handler.command = ['ytmp4', 'mp4'];
handler.limit = true;

export default handler;