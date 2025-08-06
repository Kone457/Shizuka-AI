import fetch from 'node-fetch';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const text = args.join(" ").trim();
  if (!text) {
    return conn.reply(
      m.chat,
      `🎬 *¿Qué deseas ver en YouTube?*\n\n📌 Uso: *${usedPrefix + command} <nombre de canción/artista>*`,
      m
    );
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 *Buscando en YouTube...*\n🎞️ Cargando transmisiones de *${text}*`,
    contextInfo: {
      externalAdReply: {
        title: "🎧 YouTube Music",
        body: "Reproducción directa desde el universo musical...",
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
    // Buscar en Spotify (simulando YouTube)
    const searchRes = await fetch(`https://api.vreden.my.id/api/spotifysearch?query=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.result || searchJson.result.length === 0) {
      return conn.reply(m.chat, `❌ No se encontraron transmisiones para *${text}*.`, m);
    }

    const track = searchJson.result[0]; // Primer resultado

    const videoUrlFake = `https://youtube.com/watch?v=${track.title.replace(/\s+/g, '')}`;
    const caption = `
🎬 *${track.title}*
👤 *Autor:* ${track.artist}
⏱️ *Duración:* ${track.duration}
📺 *Popularidad:* ${track.popularity}
🔗 *YouTube:* ${videoUrlFake}
`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: track.coverArt },
      caption
    }, { quoted: m });

    // Descargar audio real desde Spotify
    const audioRes = await fetch(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(track.spotifyLink)}`);
    const audioJson = await audioRes.json();

    if (!audioJson.result || !audioJson.result.music) {
      return conn.reply(m.chat, `❌ No se pudo obtener el audio para *${track.title}*.`, m);
    }

    const { title, music } = audioJson.result;

    await conn.sendMessage(m.chat, {
      audio: { url: music },
      fileName: `${title}.mp3`,
      mimetype: "audio/mp4",
      ptt: false
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error al simular YouTube:", e);
    return conn.reply(m.chat, `❌ *Error en la simulación YouTube.*\n\n🛠️ ${e.message}`, m);
  }
};

handler.command = /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre de canción/artista>'];

export default handler;
