import fetch from 'node-fetch';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const text = args.join(" ").trim();
  if (!text) {
    return conn.reply(m.chat, `🎵 *¿Qué deseas escuchar?*\n\n📌 Uso: *${usedPrefix + command} <nombre de canción/artista>*`, m);
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 *Buscando en Spotify...*\n🎶 Explorando sonidos ocultos de *${text}*`,
    contextInfo: {
      externalAdReply: {
        title: "🎧 Shizuka Music",
        body: "Conectando emociones a través del ritmo...",
        mediaType: 1,
        previewType: 0,
        mediaUrl: "https://open.spotify.com",
        sourceUrl: "https://open.spotify.com",
        thumbnailUrl: "https://qu.ax/QuwNu.jpg",
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });

  try {
    // Buscar en Spotify
    const searchRes = await fetch(`https://api.vreden.my.id/api/spotifysearch?query=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.result || searchJson.result.length === 0) {
      return conn.reply(m.chat, `❌ No se encontraron resultados para *${text}*.`, m);
    }

    const track = searchJson.result[0]; // Tomamos el primero por defecto

    const trackCaption = `
🎶 *${track.title}*
👤 *Artista:* ${track.artist}
📀 *Álbum:* ${track.album}
⏱️ *Duración:* ${track.duration}
📈 *Popularidad:* ${track.popularity}
🗓️ *Lanzamiento:* ${track.releaseDate}
🔗 *Spotify:* ${track.spotifyLink}

✨ Descargando audio... prepárate para sumergirte en el ritmo.
`.trim();

    // Mostrar imagen y datos
    await conn.sendMessage(m.chat, {
      image: { url: track.coverArt },
      caption: trackCaption
    }, { quoted: m });

    // Descargar audio desde URL de Spotify
    const audioRes = await fetch(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(track.spotifyLink)}`);
    const audioJson = await audioRes.json();

    if (!audioJson.result || !audioJson.result.music) {
      return conn.reply(m.chat, `❌ No se pudo obtener el audio para *${track.title}*.`, m);
    }

    const { title, artists, cover, music } = audioJson.result;
    const audioCaption = `
🎧 *${title}* - ${artists}
💽 Listo para reproducir. ¡Disfrútalo como si fueras parte del mix!

💫 *Shizuka te acompaña con cada nota.*
`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: cover },
      caption: audioCaption
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: music },
      fileName: `${title}.mp3`,
      mimetype: "audio/mp4",
      ptt: false
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error:", e);
    return conn.reply(m.chat, `❌ *Ocurrió un error al procesar tu solicitud.*\n🛠️ ${e.message}`, m);
  }
};

handler.command = /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre de canción/artista>'];

export default handler;
