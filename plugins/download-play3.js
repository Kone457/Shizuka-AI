import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('⚠️ Ingresa el nombre de la música.');
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

    const searchRes = await fetch(`https://nexevo.onrender.com/search/youtube?q=${encodeURIComponent(text)}`);
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
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 Error.');
  }
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  try {
    if (id.startsWith('audio_')) {
      const link = id.replace('audio_', '');
      await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } });

      let videoId = '';
      if (link.includes('youtu.be/')) {
        videoId = link.split('youtu.be/')[1].split('?')[0];
      } else if (link.includes('youtube.com/watch?v=')) {
        videoId = link.split('v=')[1].split('&')[0];
      }

      const apis = [
        async () => {
          const apiUrl = `https://nexevo.onrender.com/download/y?url=${encodeURIComponent(link)}`;
          const res = await fetch(apiUrl);
          const json = await res.json();
          
          if (json.status && json.result?.url && json.result.type === 'audio') {
            let title = 'Audio de YouTube';
            if (videoId) {
              try {
                const searchRes = await fetch(`https://nexevo.onrender.com/search/youtube?q=${encodeURIComponent(videoId)}`);
                const searchJson = await searchRes.json();
                if (searchJson.status && searchJson.result?.[0]?.title) {
                  title = searchJson.result[0].title;
                }
              } catch (e) {}
            }
            
            return {
              url: json.result.url,
              title: title,
              duration: json.result.info?.duration || 'Desconocida',
              quality: json.result.quality + ' kbps'
            };
          }
          throw new Error();
        },
        async () => {
          const res = await fetch(`https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(link)}&format=mp3`);
          const json = await res.json();
          if (json.success && json.result?.downloadUrl) {
            return {
              url: json.result.downloadUrl,
              title: json.result.title || 'audio',
              duration: json.result.duration || 'Desconocida',
              quality: json.result.quality || '128 kbps'
            };
          }
          throw new Error();
        },
        async () => {
          const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${link}&quality=128`);
          const json = await res.json();
          if (json.status && json.result?.download?.status !== false && json.result.download?.url) {
            return {
              url: json.result.download.url,
              title: json.result.metadata?.title || 'audio',
              duration: json.result.metadata?.duration?.timestamp || 'Desconocida',
              quality: '128 kbps'
            };
          }
          throw new Error();
        }
      ];

      let audioData = null;
      for (const api of apis) {
        try {
          audioData = await api();
          break;
        } catch (e) {}
      }

      if (!audioData) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply('⚠️ No se pudo obtener el audio.');
      }

      const caption = `𖣣ֶㅤ֯⌗ 🅨𝖙 🅐🅤🅓🅘🅞\n\n🎶 *Título:* ${audioData.title}\n⏱️ *Duración:* ${audioData.duration}\n📊 *Calidad:* ${audioData.quality}\n🫗 *Formato:* MP3`;

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audioData.url },
          mimetype: 'audio/mpeg',
          fileName: `${audioData.title.replace(/[^\w\s]/gi, '')}.mp3`,
          caption
        },
        { quoted: m }
      );
    }

    if (id.startsWith('video_')) {
      const link = id.replace('video_', '');
      await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });

      let videoId = '';
      if (link.includes('youtu.be/')) {
        videoId = link.split('youtu.be/')[1].split('?')[0];
      } else if (link.includes('youtube.com/watch?v=')) {
        videoId = link.split('v=')[1].split('&')[0];
      }

      const apis = [
        async () => {
          const apiUrl = `https://nexevo.onrender.com/download/y2?url=${encodeURIComponent(link)}`;
          const res = await fetch(apiUrl);
          const json = await res.json();
          
          if (json.status && json.result?.url && json.result.type === 'video') {
            let title = 'Video de YouTube';
            if (videoId) {
              try {
                const searchRes = await fetch(`https://nexevo.onrender.com/search/youtube?q=${encodeURIComponent(videoId)}`);
                const searchJson = await searchRes.json();
                if (searchJson.status && searchJson.result?.[0]?.title) {
                  title = searchJson.result[0].title;
                }
              } catch (e) {}
            }
            
            return {
              url: json.result.url,
              title: title,
              quality: json.result.quality + 'p'
            };
          }
          throw new Error();
        },
        async () => {
          const res = await fetch(`https://api.nekolabs.web.id/downloader/youtube/v1?url=${encodeURIComponent(link)}&format=360`);
          const json = await res.json();
          if (json.success && json.result?.downloadUrl) {
            return {
              url: json.result.downloadUrl,
              title: json.result.title || 'video',
              quality: json.result.quality || '360p'
            };
          }
          throw new Error();
        },
        async () => {
          const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${link}&quality=360`);
          const json = await res.json();
          if (json.status && json.result?.download?.status !== false && json.result.download?.url) {
            return {
              url: json.result.download.url,
              title: json.result.metadata?.title || 'video',
              quality: json.result.download.quality || '360p'
            };
          }
          throw new Error();
        }
      ];

      let videoData = null;
      for (const api of apis) {
        try {
          videoData = await api();
          break;
        } catch (e) {}
      }

      if (!videoData) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply('⚠️ No se pudo obtener el video.');
      }

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      
      await conn.sendMessage(m.chat, {
        video: { url: videoData.url },
        fileName: `${videoData.title.replace(/[^\w\s]/gi, '')} (${videoData.quality}).mp4`,
        mimetype: 'video/mp4'
      }, { quoted: m });
    }
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 Error.');
  }
};

handler.command = ['play', 'play2'];
handler.tags = ['descargas'];
handler.help = ['play <nombre>'];

export default handler;