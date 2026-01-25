import fetch from 'node-fetch';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  try {
    if (!text) {
      await conn.sendMessage(m.chat, { react: { text: '❔', key: m.key } });
      return m.reply(
        `🎵 *TikTok Search & Download*\n\n` +
        `*Buscar y descargar videos:*\n` +
        `• ${usedPrefix}tik <término_búsqueda>\n\n` +
        `*Ejemplos:*\n` +
        `• ${usedPrefix}tik memes graciosos\n` +
        `• ${usedPrefix}tik música 2024\n` +
        `• ${usedPrefix}tik baile viral`
      );
    }

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });
    
    const searchRes = await fetch(`https://nexevo.onrender.com/search/tiktok?q=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.status || !searchJson.result || searchJson.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
      return m.reply(`⚠️ No se encontraron resultados para *${text}*`);
    }

    const videos = searchJson.result.slice(0, 5);
    
    if (!conn.tiktokSearchResults) conn.tiktokSearchResults = {};
    conn.tiktokSearchResults[m.sender] = videos;

    let videosProcessed = 0;
    let videosFailed = 0;

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      
      try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
        
        const videoRes = await fetch(`https://nexevo.onrender.com/download/tiktok?url=https://www.tiktok.com/@user/video/${video.video_id}`);
        const videoJson = await videoRes.json();
        
        let videoUrl, videoData;
        
        if (videoJson.status && videoJson.result?.data?.play) {
          videoData = videoJson.result.data;
          videoUrl = videoData.hdplay || videoData.play || videoData.wmplay;
        } else {
          videoUrl = video.play || video.wmplay;
          videoData = video;
        }
        
        if (!videoUrl) {
          videosFailed++;
          continue;
        }
        
        const caption = `🎵 *TikTok Search Result ${i + 1}/${videos.length}*\n\n` +
          `📌 *Título:* ${video.title || 'Sin título'}\n` +
          `⏱️ *Duración:* ${video.duration || 'N/D'} seg\n` +
          `👤 *Autor:* ${video.author?.nickname || 'Desconocido'}\n` +
          `❤️ *Likes:* ${video.digg_count?.toLocaleString() || '0'}\n` +
          `▶️ *Reproducciones:* ${video.play_count?.toLocaleString() || '0'}\n` +
          `🔍 *Búsqueda:* ${text}`;
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        
        await conn.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            caption,
            mimetype: 'video/mp4',
            fileName: `tiktok_${i + 1}_${Date.now()}.mp4`,
            thumbnail: video.cover ? await (await fetch(video.cover)).buffer() : null
          },
          { quoted: i === 0 ? m : null }
        );
        
        videosProcessed++;
        
        if (i < videos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
      } catch (videoError) {
        videosFailed++;
        continue;
      }
    }

  } catch (error) {
    console.error('Error TikTok Search:', error, 'Query:', text);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar la búsqueda.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['tik'];
handler.tags = ['descargas'];
handler.command = ['tik', 'tiktoksearch'];

export default handler;