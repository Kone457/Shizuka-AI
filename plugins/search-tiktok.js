import fetch from 'node-fetch';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  try {
    if (!text) {
      await conn.sendMessage(m.chat, { react: { text: '❔', key: m.key } });
      return m.reply(
        `🎵 *TikTok Downloader*\n\n` +
        `*Descargar por URL:*\n` +
        `• ${usedPrefix}${command} <enlace_tiktok>\n\n` +
        `*Buscar videos:*\n` +
        `• ${usedPrefix}${command} .tik <término_búsqueda>\n\n` +
        `*Ejemplos:*\n` +
        `• ${usedPrefix}${command} https://vm.tiktok.com/abc123\n` +
        `• ${usedPrefix}${command} .tik memes graciosos\n` +
        `• ${usedPrefix}${command} .tik música 2024`
      );
    }

    if (text.startsWith('.tik ')) {
      const query = text.replace('.tik ', '').trim();
      if (!query) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply('⚠️ Ingresa un término de búsqueda');
      }

      await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });
      
      const searchRes = await fetch(`https://nexapi.onrender.com/search/tiktok?q=${encodeURIComponent(query)}`);
      const searchJson = await searchRes.json();

      if (!searchJson.status || !searchJson.result || searchJson.result.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply(`⚠️ No se encontraron resultados para *${query}*`);
      }

      const videos = searchJson.result.slice(0, 5);
      
      let resultsMessage = `🔍 *Resultados de búsqueda para:* ${query}\n\n`;
      
      videos.forEach((video, index) => {
        resultsMessage += 
          `*${index + 1}. ${video.title || 'Sin título'}*\n` +
          `👤 Autor: ${video.author?.nickname || 'Desconocido'}\n` +
          `⏱️ Duración: ${video.duration || 'N/D'} seg\n` +
          `❤️ Likes: ${video.digg_count?.toLocaleString() || '0'}\n` +
          `▶️ Reproducciones: ${video.play_count?.toLocaleString() || '0'}\n\n`;
      });

      resultsMessage += 
        `*Para descargar un video, usa:*\n` +
        `${usedPrefix}tt <url_del_video>\n\n` +
        `*O responde a este mensaje con:*\n` +
        `${usedPrefix}ttdesc <número>`;

      if (!conn.tiktokSearchResults) conn.tiktokSearchResults = {};
      conn.tiktokSearchResults[m.sender] = videos;

      await conn.sendMessage(m.chat, { 
        text: resultsMessage,
        contextInfo: {
          externalAdReply: {
            title: `TikTok Search - ${query}`,
            body: `Encontrados ${videos.length} videos`,
            thumbnail: videos[0]?.cover ? await (await fetch(videos[0].cover)).buffer() : null,
            sourceUrl: 'https://tiktok.com',
            mediaType: 1
          }
        }
      });

      return;

    } else if (text.match(/tiktok\.com|vm\.tiktok\.com/)) {
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      const res = await fetch(`https://nexapi.onrender.com/download/tiktok?url=${encodeURIComponent(text)}`);
      const json = await res.json();

      if (!json.status || !json.result?.data?.play) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply('⚠️ No se pudo obtener el *video*. Intenta con otro enlace.');
      }

      const data = json.result.data;
      const videoUrl = data.hdplay || data.play || data.wmplay;

      const caption = `𖣣ֶㅤ֯⌗ 🅣𝖐 🅓ownload\n\n` +
        `🎧 *Título:* ${data.title || 'Sin título'}\n` +
        `⏱️ *Duración:* ${data.duration || 'N/D'} seg\n` +
        `👤 *Autor:* ${data.author?.nickname || 'Desconocido'}\n` +
        `❤️ *Likes:* ${data.digg_count?.toLocaleString() || '0'}\n` +
        `▶️ *Reproducciones:* ${data.play_count?.toLocaleString() || '0'}\n` +
        `🫗 *Enlace:* ${text}`;

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await conn.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption,
          mimetype: 'video/mp4',
          fileName: `tiktok_${Date.now()}.mp4`,
          thumbnail: data.cover ? await (await fetch(data.cover)).buffer() : null
        },
        { quoted: m }
      );

    } else {
      if (text.startsWith('desc ') || command === 'ttdesc') {
        const index = parseInt(text.replace('desc ', '')) - 1;
        
        if (!conn.tiktokSearchResults || !conn.tiktokSearchResults[m.sender]) {
          await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
          return m.reply('⚠️ No hay resultados de búsqueda previos. Realiza una búsqueda primero.');
        }

        const videos = conn.tiktokSearchResults[m.sender];
        
        if (isNaN(index) || index < 0 || index >= videos.length) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return m.reply(`❌ Ingresa un número válido (1-${videos.length})`);
        }

        const video = videos[index];
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const videoRes = await fetch(`https://nexapi.onrender.com/download/tiktok?url=https://www.tiktok.com/@user/video/${video.video_id}`);
        const videoJson = await videoRes.json();

        if (videoJson.status && videoJson.result?.data?.play) {
          const videoData = videoJson.result.data;
          const videoUrl = videoData.hdplay || videoData.play || videoData.wmplay;

          const caption = `𖣣ֶㅤ֯⌗ 🅣𝖐 🅓ownload\n\n` +
            `🎧 *Título:* ${video.title || 'Sin título'}\n` +
            `⏱️ *Duración:* ${video.duration || 'N/D'} seg\n` +
            `👤 *Autor:* ${video.author?.nickname || 'Desconocido'}\n` +
            `❤️ *Likes:* ${video.digg_count?.toLocaleString() || '0'}\n` +
            `▶️ *Reproducciones:* ${video.play_count?.toLocaleString() || '0'}`;

          await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

          await conn.sendMessage(
            m.chat,
            {
              video: { url: videoUrl },
              caption,
              mimetype: 'video/mp4',
              fileName: `tiktok_${Date.now()}.mp4`,
              thumbnail: video.cover ? await (await fetch(video.cover)).buffer() : null
            },
            { quoted: m }
          );
        } else {
          const videoUrl = video.play || video.wmplay;
          if (videoUrl) {
            const caption = `𖣣ֶㅤ֯⌗ 🅣𝖐 🅓ownload\n\n` +
              `🎧 *Título:* ${video.title || 'Sin título'}\n` +
              `⏱️ *Duración:* ${video.duration || 'N/D'} seg\n` +
              `👤 *Autor:* ${video.author?.nickname || 'Desconocido'}\n` +
              `❤️ *Likes:* ${video.digg_count?.toLocaleString() || '0'}\n` +
              `▶️ *Reproducciones:* ${video.play_count?.toLocaleString() || '0'}`;

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            await conn.sendMessage(
              m.chat,
              {
                video: { url: videoUrl },
                caption,
                mimetype: 'video/mp4',
                fileName: `tiktok_${Date.now()}.mp4`,
                thumbnail: video.cover ? await (await fetch(video.cover)).buffer() : null
              },
              { quoted: m }
            );
          } else {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            m.reply('❌ No se pudo obtener el video. Intenta con otro resultado.');
          }
        }
      } else {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply('❌ Comando no reconocido. Usa:\n• .tt <enlace_tiktok>\n• .tt .tik <búsqueda>');
      }
    }

  } catch (error) {
    console.error('Error TikTok:', error, 'URL:', text);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 *Error al procesar el video.* Intenta nuevamente más tarde.');
  }
};

handler.help = ['tik'];
handler.tags = ['descargas'];
handler.command = ['ttsearch', 'tik'];

export default handler;