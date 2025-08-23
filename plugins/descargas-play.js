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
    const res = await fetch(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.result || !json.result.metadata || !json.result.download) {
      return conn.sendMessage(m.chat, {
        text: `❌ No se encontraron transmisiones para *${text}*.`,
        contextInfo
      }, { quoted: m });
    }

    const { metadata, download } = json.result;
    const caption = `
🎬 *${metadata.title}*
👤 *Autor:* ${metadata.author.name}
⏱️ *Duración:* ${metadata.duration.timestamp}
📺 *Vistas:* ${metadata.views}
🕰️ *Publicado:* ${metadata.ago}
🔗 *YouTube:* ${metadata.url}
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
    console.error("⚠️ Error al simular YouTube:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 *La transmisión se desvaneció entre bambalinas...*\n\n🛠️ ${e.message}`,
      contextInfo
    }, { quoted: m });
  }
};

 /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre de canción/artista>'];

export default handler;