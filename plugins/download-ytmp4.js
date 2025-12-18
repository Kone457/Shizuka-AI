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

    // Método 1: Usar otra API - ytdl-free (alternativa)
    const apiUrl = `https://ytdl.samascorp.com/api?url=${encodeURIComponent(args[0])}`;
    
    console.log('Consultando API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta API:', JSON.stringify(data, null, 2));

    if (!data || !data.formats || data.formats.length === 0) {
      // Método alternativo si la primera API falla
      return await tryAlternativeMethod(m, conn, args[0], title);
    }

    const formats = data.formats;
    const title = data.title || data.info?.title || 'Video YouTube';
    
    // Filtrar solo formatos de video con audio
    const videoFormats = formats.filter(format => 
      format.hasAudio === true && 
      format.hasVideo === true &&
      format.container === 'mp4'
    );
    
    console.log('Formatos de video con audio:', videoFormats.map(f => ({
      quality: f.qualityLabel,
      hasAudio: f.hasAudio,
      hasVideo: f.hasVideo
    })));

    // Buscar 720p
    let selectedFormat = videoFormats.find(f => 
      f.qualityLabel === '720p' || 
      f.qualityLabel === '720p60' ||
      (f.height === 720 && f.hasAudio)
    );

    // Si no hay 720p, buscar 360p
    if (!selectedFormat) {
      selectedFormat = videoFormats.find(f => 
        f.qualityLabel === '360p' ||
        (f.height === 360 && f.hasAudio)
      );
    }

    // Si aún no hay, tomar el mejor formato con audio
    if (!selectedFormat && videoFormats.length > 0) {
      // Ordenar por calidad (mayor a menor)
      videoFormats.sort((a, b) => {
        const heightA = a.height || 0;
        const heightB = b.height || 0;
        return heightB - heightA;
      });
      selectedFormat = videoFormats[0];
    }

    // Si no hay formatos con audio, buscar cualquier video mp4
    if (!selectedFormat) {
      const anyMp4 = formats.find(f => 
        f.container === 'mp4' && 
        f.hasVideo === true
      );
      selectedFormat = anyMp4;
    }

    if (!selectedFormat || !selectedFormat.url) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      
      let availableFormats = formats.slice(0, 10).map(f => 
        `• ${f.qualityLabel || f.container} - ${f.hasAudio ? 'Con Audio' : 'Solo Video'}`
      ).join('\n');
      
      return m.reply(`⚠️ No se encontró un formato MP4 compatible\n\n📋 Primeros 10 formatos:\n${availableFormats}`);
    }

    const videoUrl = selectedFormat.url;
    const quality = selectedFormat.qualityLabel || `${selectedFormat.height}p` || 'Desconocida';
    
    // Determinar mensaje según calidad
    let qualityMsg = '';
    if (quality.includes('720') || selectedFormat.height === 720) {
      qualityMsg = '✅ Descargado en 720p';
    } else if (quality.includes('360') || selectedFormat.height === 360) {
      qualityMsg = 'ℹ️ Descargado en 360p (720p no disponible)';
    } else {
      qualityMsg = `⚠️ Descargado en calidad disponible: ${quality}`;
    }
    
    const caption = `🎬 *YouTube Video*\n
📌 *Título:* ${title}
📊 *Calidad:* ${quality}
🔗 *Formato:* MP4
${selectedFormat.hasAudio ? '🔊 *Audio:* Incluido' : '⚠️ *Audio:* Posiblemente sin audio'}

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
    
    // Intentar método alternativo
    try {
      return await tryAlternativeMethod(m, conn, args[0]);
    } catch (altError) {
      return m.reply(`💥 Error al descargar el video. Intenta con otro enlace.\n\nError: ${error.message}`);
    }
  }
};

// Función alternativa usando otra API
async function tryAlternativeMethod(m, conn, url, title = 'Video YouTube') {
  try {
    console.log('Intentando método alternativo...');
    
    // API alternativa: yt-dlp compatible
    const altApiUrl = `https://co.wuk.sh/api/json?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(altApiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!data || !data.url) {
      throw new Error('No se pudo obtener el video');
    }

    // Esta API generalmente devuelve la mejor calidad disponible
    const videoUrl = data.url;
    const quality = data.quality || 'Mejor calidad disponible';
    
    const caption = `🎬 *YouTube Video*\n
📌 *Título:* ${title}
📊 *Calidad:* ${quality}
🔗 *Formato:* MP4

✅ Descargado en la mejor calidad disponible
`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

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
    console.error('Error método alternativo:', error);
    throw error;
  }
}

handler.help = ['ytmp4 <url>'];
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'mp4'];
handler.limit = true;

export default handler;