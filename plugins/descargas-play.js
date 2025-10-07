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
    let finalUrl = isUrl ? input : null;

    if (!isUrl) {
      const search = await fetch(
        `https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(input)}`
      );
      const jsonSearch = await search.json();
      if (!jsonSearch.status || !jsonSearch.data?.length) {
        return conn.sendMessage(m.chat, {
          text: `❌ No se encontraron resultados para ${input}.`,
          contextInfo
        }, { quoted: m });
      }
      finalUrl = jsonSearch.data[0].url;
    }

    // 🎶 Descargar audio con la API de Vreden
    const res = await fetch(
      `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(finalUrl)}&quality=128`
    );
    const jsonDl = await res.json();
    if (!jsonDl.status || !jsonDl.result?.download?.url) {
      return conn.sendMessage(m.chat, {
        text: `❌ No se pudo obtener el audio de ${input}.`,
        contextInfo
      }, { quoted: m });
    }

    const { metadata, download } = jsonDl.result;

    const caption = `
🎬 ${metadata.title}
👤 Canal: ${metadata.author.name}
📺 Vistas: ${metadata.views.toLocaleString()}
⏱️ Duración: ${metadata.timestamp}
🎵 Calidad: ${download.quality}
🔗 YouTube: ${metadata.url}
    `.trim();

    await conn.sendMessage(m.chat, {
      image: { url: metadata.thumbnail },
      caption,
      contextInfo
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: download.url },
      fileName: download.filename,
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
handler.coin = 250;

export default handler;