import fetch from 'node-fetch';

// 🔍 Búsqueda con múltiples APIs en cascada
const getVideoResult = async (query) => {
  // EliasarYT
  try {
    const res = await fetch(`https://eliasar-yt-api.vercel.app/api/search/youtube?query=${encodeURIComponent(query)}`);
    const json = await res.json();
    const list = json?.results?.resultado;
    if (list?.length) return list[0];
  } catch (err) {
    console.warn('⚠️ EliasarYT falló:', err.message);
  }

  // Dorratz
  try {
    const res = await fetch(`https://api.dorratz.com/v3/yt-search?query=${encodeURIComponent(query)}`);
    const json = await res.json();
    const list = json?.data || json?.result?.all;
    if (list?.length) return list[0];
  } catch (err) {
    console.warn('⚠️ Dorratz falló:', err.message);
  }

  // Starlight Team
  try {
    const res = await fetch(`https://apis-starlights-team.koyeb.app/starlight/youtube-search?text=${encodeURIComponent(query)}`);
    const json = await res.json();
    const list = json?.results;
    if (list?.length) return list[0];
  } catch (err) {
    console.warn('⚠️ Starlight API falló:', err.message);
  }

  // Delirius
  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    const list = json?.data;
    if (list?.length) return list[0];
  } catch (err) {
    console.warn('⚠️ Delirius API falló:', err.message);
  }

  // Sylphy
  try {
    const res = await fetch(`https://api.sylphy.xyz/search/youtube?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    const list = json?.res;
    if (list?.length) return list[0];
  } catch (err) {
    console.warn('⚠️ Sylphy API falló:', err.message);
  }

  return null;
};

// 🔧 Comando principal
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const thumbnailCard = 'https://qu.ax/phgPU.jpg';

  if (!text) {
    await conn.sendMessage(m.chat, {
      text: `🔎 *Escribe el nombre de un video para buscar en YouTube.*\nEjemplo:\n${usedPrefix + command} Empire funk`,
      footer: '📺 Búsqueda con múltiples APIs',
      contextInfo: {
        externalAdReply: {
          title: 'YouTube MP4 Downloader',
          body: 'Busca y descarga videos fácilmente',
          thumbnailUrl: thumbnailCard,
          sourceUrl: 'https://api.vreden.my.id'
        }
      }
    }, { quoted: m });
    return;
  }

  await conn.sendMessage(m.chat, {
    text: '⏳ *Buscando tu video...*\n🔍 Probando múltiples fuentes hasta encontrar el mejor resultado.',
    footer: '🧩 Preparando tu contenido con estilo',
    contextInfo: {
      externalAdReply: {
        title: 'Buscando en YouTube...',
        body: 'Esto tomará solo unos segundos',
        thumbnailUrl: thumbnailCard,
        sourceUrl: 'https://api.vreden.my.id'
      }
    }
  }, { quoted: m });

  const selected = await getVideoResult(text);
  if (!selected) {
    return m.reply(`❌ No se encontró ningún video para: ${text}\n📛 Intenta con otro término.`);
  }

  try {
    // 🎥 Descarga vía Vreden
    const downloadRes = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(selected.url)}`);
    const downloadJson = await downloadRes.json();
    const result = downloadJson?.result;
    const meta = result?.metadata;
    const dl = result?.download;

    if (!result?.status || !dl?.url) {
      return m.reply(`⚠️ No se pudo obtener el enlace de descarga para: ${selected.title}`);
    }

    const caption = `
🎬 *${meta.title}*
🎙️ Autor: ${meta.author.name}
📅 Publicado: ${meta.ago}
⏱️ Duración: ${meta.timestamp}
👁️ Vistas: ${meta.views.toLocaleString()}
📝 ${meta.description.slice(0, 160)}...
📥 Calidad: ${dl.quality}
📄 Archivo: ${dl.filename}
`;

    await conn.sendMessage(m.chat, {
      image: { url: meta.image || meta.thumbnail || thumbnailCard },
      caption,
      footer: '🎥 Video obtenido vía Vreden API',
      contextInfo: {
        externalAdReply: {
          title: meta.title,
          body: 'Click para ver o descargar',
          thumbnailUrl: meta.thumbnail || thumbnailCard,
          sourceUrl: selected.url
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      video: { url: dl.url },
      mimetype: 'video/mp4',
      fileName: dl.filename || 'video.mp4'
    }, { quoted: m });

  } catch (error) {
    console.error('💥 Error en YouTube plugin:', error);
    m.reply(`❌ Ocurrió un error al procesar tu solicitud.\n📛 ${error.message}`);
  }
};

handler.command = ['playvideo', 'buscayoutube'];
export default handler;