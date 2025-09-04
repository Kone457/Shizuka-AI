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
      text: `🎬 *¿Qué deseas ver en YouTube?*\n\n📌 Uso: *${usedPrefix + command} <nombre de canción/artista>*`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 *Buscando en YouTube...*\n🎞️ Cargando transmisiones de *${text}*`,
    contextInfo
  }, { quoted: m });

  try {
    // Buscar en YouTube
    const search = await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`);
    const jsonSearch = await search.json();

    if (!jsonSearch.status || !jsonSearch.data || jsonSearch.data.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `❌ No se encontraron resultados para *${text}*.`,
        contextInfo
      }, { quoted: m });
    }

    // Tomar el primer resultado
    const video = jsonSearch.data[0];

    // Descargar MP3
    const dl = await fetch(`https://delirius-apiofc.vercel.app/download/ytmp3?url=${encodeURIComponent(video.url)}`);
    const jsonDl = await dl.json();

    if (!jsonDl.estado || !jsonDl.datos || !jsonDl.datos.descargar) {
      return conn.sendMessage(m.chat, {
        text: `⚠️ No se pudo obtener el audio de *${video.title}*.`,
        contextInfo
      }, { quoted: m });
    }

    const datos = jsonDl.datos;

    const caption = `
🎬 *${datos.título}*
👤 *Autor:* ${datos.autor}
⏱️ *Duración:* ${Math.floor(datos.duración / 60)}:${(datos.duración % 60).toString().padStart(2, "0")}
📺 *Vistas:* ${datos.vistas}
👍 *Likes:* ${datos["me gusta"]}
💬 *Comentarios:* ${datos.comentarios}
📂 *Tamaño:* ${datos.descargar.tamaño}
🔗 *YouTube:* ${video.url}
`.trim();

    // Enviar información con miniatura
    await conn.sendMessage(m.chat, {
      image: { url: datos["resolución máxima de la imagen"] || datos.imagen },
      caption,
      contextInfo
    }, { quoted: m });

    // Enviar audio MP3
    await conn.sendMessage(m.chat, {
      audio: { url: datos.descargar.url },
      fileName: datos.descargar.filename,
      mimetype: "audio/mp4",
      ptt: false,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error en YouTube:", e);
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