import fetch from 'node-fetch';

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

    // Llamar directamente a la API
    const api = 'https://api.vidfly.ai/api/media/youtube/download';
    const headers = {
      'Content-Type': 'application/json',
      'X-App-Name': 'vidfly-web',
      'X-App-Version': '1.0.0',
      'User-Agent': 'Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0',
      'Referer': 'https://vidfly.ai/es/youtube-video-downloader/'
    };

    const response = await fetch(`${api}?url=${encodeURIComponent(args[0])}`, { headers });
    const data = await response.json();

    if (data.code !== 0 || !data.data || !data.data.items || data.data.items.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se pudo obtener el video o no hay formatos disponibles');
    }

    const items = data.data.items;
    const title = data.data.title || 'Video YouTube';
    const cover = data.data.cover;

    // Mostrar todos los formatos para debug
    console.log('Formatos disponibles:', items.map(item => ({
      type: item.type,
      label: item.label,
      url: item.url ? 'Sí' : 'No'
    })));

    // Función para extraer calidad numérica
    const getQualityNumber = (label) => {
      const match = label.match(/(\d+)p/);
      return match ? parseInt(match[1]) : 0;
    };

    // Primero buscar VIDEO_WITH_AUDIO mp4 (720p)
    let selectedVideo = items.find(item => 
      item.type === 'VIDEO_WITH_AUDIO' && 
      item.label.includes('mp4') && 
      item.label.includes('720p')
    );

    // Si no hay, buscar VIDEO_WITH_AUDIO mp4 (360p)
    if (!selectedVideo) {
      selectedVideo = items.find(item => 
        item.type === 'VIDEO_WITH_AUDIO' && 
        item.label.includes('mp4') && 
        item.label.includes('360p')
      );
    }

    // Si no hay VIDEO_WITH_AUDIO, buscar VIDEO mp4 (720p)
    if (!selectedVideo) {
      selectedVideo = items.find(item => 
        item.type === 'VIDEO' && 
        item.label.includes('mp4') && 
        item.label.includes('720p')
      );
    }

    // Si no hay, buscar VIDEO mp4 (360p)
    if (!selectedVideo) {
      selectedVideo = items.find(item => 
        item.type === 'VIDEO' && 
        item.label.includes('mp4') && 
        item.label.includes('360p')
      );
    }

    // Si aún no hay, buscar cualquier mp4
    if (!selectedVideo) {
      selectedVideo = items.find(item => 
        (item.type === 'VIDEO_WITH_AUDIO' || item.type === 'VIDEO') && 
        item.label.includes('mp4')
      );
    }

    // Si aún no hay, buscar cualquier VIDEO_WITH_AUDIO
    if (!selectedVideo) {
      selectedVideo = items.find(item => item.type === 'VIDEO_WITH_AUDIO');
    }

    // Si aún no hay, buscar cualquier VIDEO
    if (!selectedVideo) {
      selectedVideo = items.find(item => item.type === 'VIDEO');
    }

    // Último recurso: tomar el primer item
    if (!selectedVideo && items.length > 0) {
      selectedVideo = items[0];
    }

    if (!selectedVideo || !selectedVideo.url) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      
      let availableFormats = items.map(item => 
        `• ${item.type} - ${item.label || 'Sin etiqueta'}`
      ).join('\n');
      
      return m.reply(`⚠️ No se encontró un formato compatible\n\n📋 Formatos disponibles:\n${availableFormats}`);
    }

    const videoUrl = selectedVideo.url;
    const quality = selectedVideo.label || 'Desconocida';
    
    // Determinar mensaje según calidad
    let qualityMsg = '';
    if (quality.includes('720p')) {
      qualityMsg = '✅ Descargado en 720p';
    } else if (quality.includes('360p')) {
      qualityMsg = 'ℹ️ Descargado en 360p (720p no disponible)';
    } else {
      qualityMsg = `⚠️ Descargado en calidad disponible: ${quality}`;
    }
    
    const caption = `🎬 *YouTube Video*\n
📌 *Título:* ${title}
📊 *Calidad:* ${quality}
🔗 *Tipo:* ${selectedVideo.type}

${qualityMsg}
`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    // Enviar el video
    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: caption,
        mimetype: 'video/mp4',
        fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp4`
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('Error detallado:', error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    return m.reply(`💥 Error interno: ${error.message}`);
  }
};

handler.help = ['ytmp4 <url>'];
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'mp4'];
handler.limit = true;

export default handler;