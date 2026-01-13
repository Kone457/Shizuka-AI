import fetch from 'node-fetch';

// Lista de APIs de respaldo para audio
const audioApis = [
  {
    name: 'nekolabs',
    url: (link) => `https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(link)}&format=mp3`
  },
  {
    name: 'vreden',
    url: (link) => `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${link}&quality=128`
  }
];

// Lista de APIs de respaldo para video
const videoApis = [
  {
    name: 'nekolabs',
    url: (link) => `https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(link)}&format=360`
  },
  {
    name: 'faa',
    url: (link) => `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(link)}`
  },
  {
    name: 'vreden_video',
    url: (link) => `https://api.vreden.my.id/api/v1/download/youtube/video?url=${link}&quality=360`
  }
];

// Función para probar APIs en secuencia hasta que una funcione
async function tryApis(apis, link, type = 'audio') {
  let lastError = null;
  
  for (const api of apis) {
    try {
      console.log(`[play] Probando API ${api.name} para ${type}...`);
      
      const response = await fetch(api.url(link));
      const json = await response.json();
      
      if (type === 'audio') {
        // Validar respuestas para audio
        if (api.name === 'nekolabs') {
          if (json.success && json.result?.downloadUrl) {
            return {
              success: true,
              api: api.name,
              downloadUrl: json.result.downloadUrl,
              title: json.result.title || 'audio',
              duration: json.result.duration || 'Desconocida',
              quality: json.result.quality || '128 kbps'
            };
          }
        } else if (api.name === 'vreden') {
          if (json.status && json.result?.download?.status !== false) {
            return {
              success: true,
              api: api.name,
              downloadUrl: json.result.download?.url || json.result?.download_url,
              title: json.result.metadata?.title || 'audio',
              duration: json.result.metadata?.duration?.timestamp || 'Desconocida',
              quality: '128 kbps'
            };
          }
        }
      } else {
        // Validar respuestas para video
        if (api.name === 'nekolabs') {
          if (json.success && json.result?.downloadUrl) {
            return {
              success: true,
              api: api.name,
              downloadUrl: json.result.downloadUrl,
              title: json.result.title || 'video',
              quality: '360p'
            };
          }
        } else if (api.name === 'faa') {
          if (json.status && json.result?.download_url) {
            return {
              success: true,
              api: api.name,
              downloadUrl: json.result.download_url,
              title: json.result.title || 'video',
              quality: '360p'
            };
          }
        } else if (api.name === 'vreden_video') {
          if (json.status && json.result?.download?.status !== false) {
            return {
              success: true,
              api: api.name,
              downloadUrl: json.result.download?.url || json.result?.download_url,
              title: json.result.metadata?.title || 'video',
              quality: '360p'
            };
          }
        }
      }
      
      lastError = `API ${api.name} no devolvió datos válidos`;
    } catch (error) {
      lastError = error.message;
      console.error(`[play] Error en API ${api.name}:`, error.message);
      // Continuar con la siguiente API
    }
  }
  
  return {
    success: false,
    error: lastError || 'Todas las APIs fallaron'
  };
}

const handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('⚠️ Ingresa el nombre de la música que deseas buscar.');
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

    const searchRes = await fetch(`https://chisato-api.vercel.app/search/youtube?q=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.status || !searchJson.result?.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ No se encontraron resultados.');
    }

    const video = searchJson.result[0];
    const { title, channel, duration, imageUrl, link } = video;

    const info = `
˚∩　ׅ　🅨𝗈𝗎𝖳𝗎𝖻𝖾 🅟𝗅𝖺𝗒　ׄᰙ　ׅ

> 🕸̴𖫲᮫ִ۫𝆬  Resultado › *${title}*

𖣣ֶㅤ֯⌗ 🐤 Canal › *${channel}*
𖣣ֶㅤ֯⌗ 🌿 Duración › *${duration}*
𖣣ֶㅤ֯⌗ 🥙 Enlace › *${link}*
`.trim();

    const thumb = await (await fetch(imageUrl)).arrayBuffer();

    await conn.sendMessage(m.chat, {
      image: Buffer.from(thumb),
      caption: info,
      footer: 'Elige cómo quieres descargarlo:',
      buttons: [
        { buttonId: `audio_${link}`, buttonText: { displayText: '🎵 Descargar Audio' }, type: 1 },
        { buttonId: `video_${link}`, buttonText: { displayText: '🎬 Descargar Video' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m });

  } catch (e) {
    console.error('[play] Error:', e);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar tu solicitud.*');
  }
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  try {
    if (id.startsWith('audio_')) {
      const link = id.replace('audio_', '');
      await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });

      // Intentar con múltiples APIs
      const audioResult = await tryApis(audioApis, link, 'audio');
      
      if (!audioResult.success) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`⚠️ No se pudo obtener el *audio*.\nError: ${audioResult.error}\n\nIntenta con otro enlace o prueba más tarde.`);
      }

      const { downloadUrl, title, duration, quality, api } = audioResult;
      
      const caption = `𖣣ֶㅤ֯⌗ 🅨𝖙 🅐🅤🅓🅘🅞 (API: ${api})\n\n🎶 *Título:* ${title}\n⏱️ *Duración:* ${duration}\n📊 *Calidad:* ${quality}\n🫗 *Formato:* MP3`;

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: downloadUrl },
          mimetype: 'audio/mpeg',
          fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
          caption
        },
        { quoted: m }
      );
    }

    if (id.startsWith('video_')) {
      const link = id.replace('video_', '');
      await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

      // Intentar con múltiples APIs
      const videoResult = await tryApis(videoApis, link, 'video');
      
      if (!videoResult.success) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`⚠️ No se pudo obtener el *video*.\nError: ${videoResult.error}\n\nIntenta con otro enlace o prueba más tarde.`);
      }

      const { downloadUrl, title, quality, api } = videoResult;
      
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      
      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        fileName: `${title.replace(/[^\w\s]/gi, '')} (${quality}).mp4`,
        mimetype: 'video/mp4',
        caption: `🎬 *Video descargado*\n📁 *API usada:* ${api}\n🔧 *Calidad:* ${quality}`
      }, { quoted: m });
    }
  } catch (e) {
    console.error('[play-buttons] Error:', e);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar tu solicitud.*');
  }
};

handler.command = ['play', 'play2'];
handler.tags = ['descargas'];
handler.help = ['play <nombre>'];

export default handler;