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
  const input = args.join(" ").trim();
  if (!input) {
    return conn.sendMessage(m.chat, {
      text: `🎬 ¿Qué deseas escuchar en YouTube?\n\n📌 Uso: ${usedPrefix + command} <nombre o enlace>`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 Procesando tu petición...\n🎵 Cargando resultados de ${input}`,
    contextInfo
  }, { quoted: m });

  try {
    const isUrl = input.includes("youtu");
    const videoUrl = isUrl ? input : null;

    // Si es texto, buscar en YouTube
    let finalUrl = videoUrl;
    if (!isUrl) {
      const search = await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(input)}`);
      const jsonSearch = await search.json();

      if (!jsonSearch.status || !jsonSearch.data || jsonSearch.data.length === 0) {
        return conn.send          text: `❌ No se encontraron resultados para ${input}.`,
          contextInfo
        }, { quoted: m });
      }

      finalUrl = jsonSearch.data[0].url;
    }

    // Descargar con la API de Delirius
    const res = await fetch(`https://delirius-apiofc.vercel.app/download/ytmp3?url=${encodeURIComponent(finalUrl)}`);
    const json = await res.json();

    if (!json.status || !json.data?.download?.url) {
      return conn.sendMessage(m.chat, {
        text obtener el audio de ${input}.`,
        contextInfo
      }, { quoted: m });
    }

    const data = json.data;
    const audio = data.download;

    const caption = `
🎬 ${data.title}
👤 Canal: ${data.author}
📺 Vistas: ${parseInt(data.views).toLocaleString()}
❤️ Likes: ${parseInt(data.likes).toLocaleString()}
💬 Comentarios: ${parseInt(data.comments).toLocaleString()}
🎵 Calidad: ${audio.quality}
📂 Tamaño: ${audio.size}
⏱️ Duración: ${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}
🔗 YouTube: https://youtu.be/${data.id}
`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: data.image_max_resolution || data.image },
      caption,
      contextInfo
    }, { quoted: m });

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
handler.help = ['play <nombre o enlace de YouTube>'];

export default handler;