import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const thumbnailCard = 'https://qu.ax/phgPU.jpg';

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🎥 *Escribe el nombre de un TikTok para buscar.*\nEjemplo:\n${usedPrefix + command} Copyright Coding`,
      footer: '🔍 Buscando video vía Vreden API',
      contextInfo: {
        externalAdReply: {
          title: 'TikTok Downloader',
          body: 'Encuentra y descarga TikToks por nombre',
          thumbnailUrl: thumbnailCard,
          sourceUrl: 'https://api.vreden.my.id'
        }
      }
    }, { quoted: m });
    return;
  }

  try {
    const searchRes = await fetch(`https://api.vreden.my.id/api/search/tiktok?query=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();
    const videos = searchJson?.result?.videos;

    if (!videos || !videos.length) {
      return m.reply(`❌ No se encontraron TikToks para: ${text}`);
    }

    const selected = videos[0];
    const tiktokLink = `https://www.tiktok.com/@/video/${selected.video_id}`;

    const dlRes = await fetch(`https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(tiktokLink)}`);
    const dlJson = await dlRes.json();

    if (!dlJson?.status || !dlJson?.data?.meta?.media[0]?.org) {
      return m.reply(`⚠️ No se pudo descargar el TikTok. Intenta con otro término.`);
    }

    const videoUrl = dlJson.data.meta.media[0].org;
    const videoTitle = selected.title || dlJson.data.title;
    const caption = `
🎬 *${videoTitle}*
👤 Autor: ${dlJson.data.author?.nickname || 'Desconocido'}
📅 Publicado: ${dlJson.data.published || 'Sin fecha'}
💬 Comentarios: ${dlJson.data.comment}
❤️ Likes: ${dlJson.data.like}
🔁 Reproducciones: ${dlJson.data.repro}
`;

    await conn.sendMessage(m.chat, {
      image: { url: selected.cover || thumbnailCard },
      caption,
      footer: '📲 Video obtenido vía Vreden + Delirius API',
      contextInfo: {
        externalAdReply: {
          title: 'TikTok Video',
          body: 'Descarga completada',
          thumbnailUrl: thumbnailCard,
          sourceUrl: 𝓟𝓸𝔀𝓮𝓻 𝓫𝔂 𝓒𝓪𝓻𝓵𝓸𝓼 
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `tiktok_${selected.video_id}.mp4`
    }, { quoted: m });

  } catch (err) {
    console.error('💥 Error en TikTok plugin:', err);
    m.reply(`❌ Error al procesar tu búsqueda.\n📛 ${err.message}`);
  }
};

handler.command = ['tt2', 'tiktokdl', 'buscatiktok'];
export default handler;