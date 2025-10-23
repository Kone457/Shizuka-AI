import fetch from 'node-fetch';

const thumbnailUrl = 'https://qu.ax/Asbfq.jpg';

const contextInfo = {
  externalAdReply: {
    title: "📺 YouTube Video",
    body: "Transmisión directa desde el universo visual...",
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
      text: `🎬 ¿Qué deseas ver en YouTube?\n\n📌 Uso: ${usedPrefix + command} <nombre o enlace>`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 Procesando tu petición...\n📺 Buscando: ${input}`,
    contextInfo
  }, { quoted: m });

  try {
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/play/video?query=${encodeURIComponent(input)}`);
    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);

    const json = await res.json();
    if (!json.status || !json.result?.download?.url) {
      throw new Error('No se pudo obtener el video. Verifica el nombre o intenta con otro término.');
    }

    const { metadata, download } = json.result;
    const caption = `🎬 *${metadata.title}*\n📺 Canal: ${metadata.author.name}\n⏱️ Duración: ${metadata.duration.timestamp}\n👁️ Vistas: ${metadata.views.toLocaleString()}\n🔗 Enlace: ${metadata.url}`;

    if (metadata.thumbnail) {
      await conn.sendMessage(m.chat, {
        image: { url: metadata.thumbnail },
        caption,
        contextInfo
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo
      }, { quoted: m });
    }

    const videoRes = await fetch(download.url);
    if (!videoRes.ok) throw new Error(`Código HTTP ${videoRes.status}`);
    const buffer = await videoRes.buffer();

    await conn.sendMessage(m.chat, {
      video: buffer,
      mimetype: 'video/mp4',
      fileName: download.filename || 'video.mp4',
      caption: `🎥 *${metadata.title}*`,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error en YouTube Video Downloader:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 La transmisión se desvaneció entre bambalinas...\n\n🛠️ ${e.message}`,
      contextInfo
    }, { quoted: m });
  }
};

handler.command = /^play2$/i;
handler.tags = ['descargas'];
handler.help = ['play2 <nombre o enlace de YouTube>'];
handler.coin = 300;

export default handler;