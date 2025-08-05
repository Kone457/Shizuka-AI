import fetch from 'node-fetch';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const text = args.join(" ").trim();
  if (!text) {
    return conn.reply(
      m.chat,
      `🔍 *¿Qué deseas escuchar en YouTube?*\n\n📌 Uso: *${usedPrefix + command} nombre de canción/artista*`,
      m
    );
  }

  // Mensaje inicial con miniatura personalizada
  await conn.sendMessage(m.chat, {
    text: `🔎 *Buscando en YouTube...*\n🎬 Espera mientras encuentro la canción *${text}*`,
    contextInfo: {
      externalAdReply: {
        title: "🎧 YouTube Music",
        body: "Explorando el universo musical...",
        mediaType: 1,
        previewType: 0,
        mediaUrl: "https://youtube.com",
        sourceUrl: "https://youtube.com",
        thumbnailUrl: "https://qu.ax/QuwNu.jpg",
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });

  try {
    // 1) Buscar link de YouTube para mostrar usando API Dorratz
    const searchRes = await fetch(`https://api.vreden.my.id/api/spotifysearch?query=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    let videoUrl = "https://youtube.com"; // fallback por si no hay resultado
    if (searchJson && searchJson.data && searchJson.data.length > 0) {
      const video = searchJson.data[0];
      videoUrl = `https://youtu.be/${video.videoId}`;
    }

    // 2) Usar la API original con el texto de búsqueda para descargar info y audio
    const downloadRes = await fetch(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(text)}`);
    const downloadJson = await downloadRes.json();

    if (!downloadJson.status || !downloadJson.result?.downloadUrl) {
      return conn.reply(m.chat, `Espera @user que esto se rompió \n ❌ *No pude descargar el audio para:* "${text}"`, m);
    }

    const { title, artist, duration, cover } = downloadJson.result.metadata;
    const audio = downloadJson.result.downloadUrl;

    const caption = `
🎶 *${title}*
📺 *Canal:* ${artist}
⏱️ *Duración:* ${duration}
🔗 *YouTube:* ${videoUrl}

✅ Audio listo. ¡Disfrútalo! 🔊
`.trim();

    // Enviar portada (solo una imagen)
    await conn.sendMessage(m.chat, {
      image: { url: cover },
      caption: caption
    }, { quoted: m });

    // Enviar audio mp3
    await conn.sendMessage(m.chat, {
      audio: { url: audio },
      fileName: `${title}.mp3`,
      mimetype: "audio/mp4",
      ptt: false
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error al procesar YouTube:", e);
    return conn.reply(m.chat, `❌ *Error al obtener el audio desde YouTube.*\n\n🛠️ ${e.message}`, m);
  }
};

handler.command = /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre de canción/artista>'];
export default handler;