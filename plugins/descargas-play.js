import fetch from 'node-fetch';

const thumbnailUrl = 'https://qu.ax/QuwNu.jpg'; // Miniatura oficial

const contextInfo = {
  externalAdReply: {
    title: "🎧 YouTube Music",
    body: "Reproducción directa desde el universo musical...",
    mediaType: 1,
    previewType: 0,
    mediaUrl: "https://youtube.com",
    sourceUrl: "https://youtube.com",
    thumbnailUrl
  }
};

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const text = args.join(" ").trim();
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🎬 *¿Qué deseas escuchar en YouTube?*\n\n📌 Uso: *${usedPrefix + command} <nombre de canción/artista>*`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 *Buscando en YouTube...*\n🎵 Cargando resultados de *${text}*`,
    contextInfo
  }, { quoted: m });

  try {
    // Buscar en YouTube (con la API de Delirius, o cualquier otra de búsqueda)
    const search = await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`);
    const jsonSearch = await search.json();

    if (!jsonSearch.status || !jsonSearch.data || jsonSearch.data.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `❌ No se encontraron resultados para *${text}*.`,
        contextInfo
      }, { quoted: m });
    }

    // Tomamos el primer resultado
    const video = jsonSearch.data[0];

    // Pasamos su URL a la API de Starlights
    const dl = await fetch(`https://api.starlights.uk/api/downloader/youtube?url=${encodeURIComponent(video.url)}`);
    const jsonDl = await dl.json();

    if (!jsonDl.status || !jsonDl.mp3) {
      return conn.sendMessage(m.chat, {
        text: `⚠️ No se pudo obtener el audio de *${video.title}*.`,
        contextInfo
      }, { quoted: m });
    }

    const { mp3 } = jsonDl;

    const caption = `
🎬 *${mp3.title}*
⏱️ *Duración:* ${video.duration}
📺 *Vistas:* ${video.views}
👤 *Canal:* ${video.author?.name || "Desconocido"}
🎵 *Calidad:* ${mp3.quality}
📂 *Tamaño:* ${mp3.size}
🔗 *YouTube:* ${video.url}
`.trim();

    // Enviar info con miniatura
    await conn.sendMessage(m.chat, {
      image: { url: mp3.thumbnail },
      caption,
      contextInfo
    }, { quoted: m });

    // Enviar audio MP3
    await conn.sendMessage(m.chat, {
      audio: { url: mp3.dl_url },
      fileName: `${mp3.title}.mp3`,
      mimetype: "audio/mp4",
      ptt: false,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error en YouTube Downloader:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 *La transmisión se desvaneció entre bambalinas...*\n\n🛠️ ${e.message}`,
      contextInfo
    }, { quoted: m });
  }
};

handler.command = /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre de canción/artista>'];

export default handler;