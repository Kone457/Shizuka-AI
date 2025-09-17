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
      text: `🎬 ¿Qué deseas escuchar en YouTube?\n\n📌 Uso: ${usedPrefix + command} <nombre de canción/artista>`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 Buscando en YouTube...\n🎵 Cargando resultados de ${text}`,
    contextInfo
  }, { quoted: m });

  try {
    // Buscar en YouTube
    const search = await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`);
    const jsonSearch = await search.json();

    if (!jsonSearch.status || !jsonSearch.data || jsonSearch.data.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `❌ No se encontraron resultados para ${text}.`,
        contextInfo
      }, { quoted: m });
    }

    // Tomamos el primer resultado
    const video = jsonSearch.data[0];

    // Usamos la API de Vreden para descargar
    const dl = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(video.url)}`);
    const jsonDl = await dl.json();

    if (!jsonDl.result?.download?.status || !jsonDl.result.download.url) {
      return conn.sendMessage(m.chat, {
        text: `⚠️ No se pudo obtener el audio de ${video.title}.`,
        contextInfo
      }, { quoted: m });
    }

    const meta = jsonDl.result.metadata;
    const audio = jsonDl.result.download;

    const caption = `
🎬 ${meta.title}
⏱️ Duración: ${meta.duration.timestamp}
📺 Vistas: ${meta.views.toLocaleString()}
👤 Canal: ${meta.author?.name || "Desconocido"}
🎵 Calidad: ${audio.quality}
📂 Tamaño: —
🔗 YouTube: ${meta.url}
`.trim();

    // Enviar info con miniatura
    await conn.sendMessage(m.chat, {
      image: { url: meta.thumbnail },
      caption,
      contextInfo
    }, { quoted: m });

    // Enviar audio MP3
    await conn.sendMessage(m.chat, {
      audio: { url: audio.url },
      fileName: audio.filename,
      mimetype: "audio/mp4",
      ptt: false,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error en YouTube Downloader:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 La transmisión se desvaneció entre bambalinas...\n\n🛠️ ${e.message}`,
      contextInfo
    }, { quoted: m });
  }
};

handler.command = /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre de canción/artista>'];

export default handler;