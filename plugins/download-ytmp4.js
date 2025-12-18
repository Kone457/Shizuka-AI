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
                    duration: info.duration || 'Desconocida',
                    channel: info.author || 'Desconocido',
                    dl: downloads
                }
            };
        } catch (error) {
            return { status: false, creador: "sistema", result: null };
        }
    }
};

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    if (!args[0]) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply(`⚠️ Ingresa un enlace de YouTube\n\nEjemplo: *${usedPrefix}ytmp4 https://youtu.be/ejemplo*`);
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
    
    // Obtener todas las calidades de video disponibles
    const videoQualities = videoData.dl
      .filter(item => item.type.includes('VIDEO') || item.format === 'mp4' || item.format === 'webm')
      .filter(item => !item.type.includes('AUDIO'))
      .map(item => {
        const qualityMatch = item.quality.match(/\d+/);
        return {
          quality: qualityMatch ? `${qualityMatch[0]}p` : item.quality,
          link: item.link,
          format: item.format,
          rawQuality: item.quality
        };
      })
      .filter((item, index, self) => 
        index === self.findIndex(t => t.quality === item.quality)
      )
      .sort((a, b) => {
        const aNum = parseInt(a.quality) || 0;
        const bNum = parseInt(b.quality) || 0;
        return bNum - aNum; // Ordenar de mayor a menor calidad
      });

    if (videoQualities.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply('⚠️ No se encontraron calidades de video disponibles');
    }

    // Crear botones dinámicos según las calidades disponibles
    const buttons = videoQualities.map((item, index) => ({
      buttonId: `quality_${index}`,
      buttonText: { displayText: `🎬 ${item.quality}` },
      type: 1
    }));

    // Añadir botón de audio si está disponible
    const audioExists = videoData.dl.some(item => item.type.includes('AUDIO') || item.format.includes('m4a') || item.format.includes('opus'));
    if (audioExists) {
      buttons.push({
        buttonId: 'audio',
        buttonText: { displayText: '🎵 Audio MP3' },
        type: 1
      });
    }

    const info = `
˚∩　ׅ　🅨𝗈𝗎𝖳𝗎𝖻𝖾 🅥𝗂𝖽𝖾𝗈　ׄᰙ　ׅ

> 🕸̴𖫲᮫ִ۫𝆬  Título › *${videoData.title}*

𖣣ֶㅤ֯⌗ 🐤 Canal › *${videoData.channel}*
𖣣ֶㅤ֯⌗ 🌿 Duración › *${videoData.duration}*
𖣣ֶㅤ֯⌗ 📊 Calidades › *${videoQualities.length} disponibles*
`.trim();

    // Guardar datos en una variable global temporal
    if (!global.ytmp4Data) global.ytmp4Data = {};
    global.ytmp4Data[m.sender] = {
      qualities: videoQualities,
      videoData: videoData,
      url: args[0],
      timestamp: Date.now()
    };

    // Limpiar datos antiguos después de 5 minutos
    setTimeout(() => {
      if (global.ytmp4Data[m.sender]) {
        delete global.ytmp4Data[m.sender];
      }
    }, 5 * 60 * 1000);

    await conn.sendMessage(m.chat, {
      image: { url: videoData.img },
      caption: info,
      footer: 'Elige la calidad que deseas descargar:',
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    return m.reply('💥 Error interno');
  }
};

// Manejar la respuesta de los botones
handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id || !global.ytmp4Data?.[m.sender]) return;

  try {
    const userData = global.ytmp4Data[m.sender];
    const { qualities, videoData, url } = userData;

    if (id === 'audio') {
      await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });
      
      // Buscar el mejor audio disponible
      const audioItems = (await ytdl.get(url)).result.dl.filter(item => 
        item.type.includes('AUDIO') || item.format.includes('m4a') || item.format.includes('opus')
      );
      
      if (audioItems.length === 0) {
        return m.reply('⚠️ No se encontró audio disponible');
      }

      const bestAudio = audioItems.sort((a, b) => {
        const aBitrate = parseInt(a.quality) || 0;
        const bBitrate = parseInt(b.quality) || 0;
        return bBitrate - aBitrate;
      })[0];

      const caption = `🎵 *YouTube Audio*\n\n📌 *Título:* ${videoData.title}\n📊 *Calidad:* ${bestAudio.quality}\n🔗 *Formato:* MP3`;

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: bestAudio.link },
          mimetype: 'audio/mpeg',
          fileName: `${videoData.title.substring(0, 100).replace(/[^\w\s]/gi, '')}.mp3`,
          caption
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      delete global.ytmp4Data[m.sender];
      return;
    }

    if (id.startsWith('quality_')) {
      const index = parseInt(id.replace('quality_', ''));
      if (isNaN(index) || index < 0 || index >= qualities.length) {
        return m.reply('⚠️ Calidad no válida');
      }

      await conn.sendMessage(m.chat, { react: { text: '⏬', key: m.key } });

      const selected = qualities[index];
      const caption = `🎬 *YouTube Video*\n\n📌 *Título:* ${videoData.title}\n📊 *Calidad:* ${selected.quality}\n🔗 *Formato:* MP4`;

      await conn.sendMessage(
        m.chat,
        {
          video: { url: selected.link },
          caption: caption,
          mimetype: 'video/mp4',
          fileName: `${videoData.title.substring(0, 100).replace(/[^\w\s]/gi, '')}_${selected.quality}.mp4`
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      delete global.ytmp4Data[m.sender];
    }

  } catch (error) {
    console.error('Error en botones:', error);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 Error al descargar');
    delete global.ytmp4Data[m.sender];
  }
};

handler.help = ['ytmp4 <url>'];
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'mp4', 'ytv'];
handler.limit = true;

export default handler;