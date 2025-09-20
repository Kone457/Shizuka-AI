import fetch from 'node-fetch';

const thumbnailUrl = 'https://qu.ax/QuwNu.jpg'; // Miniatura oficial

const contextInfo = {
  externalAdReply: {
    title: "🎧 Spotify Music",
    body: "Reproducción directa desde el universo musical...",
    mediaType: 1,
    previewType: 0,
    mediaUrl: "https://open.spotify.com",
    sourceUrl: "https://open.spotify.com",
    thumbnailUrl
  }
};

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const input = args.join(" ").trim();
  if (!input) {
    return conn.sendMessage(m.chat, {
      text: `🎶 ¿Qué deseas escuchar en Spotify?\n\n📌 Uso: ${usedPrefix + command} <nombre o enlace>`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 Buscando en Spotify...\n🎵 Cargando resultados de: ${input}`,
    contextInfo
  }, { quoted: m });

  try {
    const isUrl = input.includes("spotify.com/track");
    let finalUrl = input;

    // Si es texto, buscar canción
    if (!isUrl) {
      const search = await fetch(`https://api.vreden.my.id/api/v1/search/spotify?query=${encodeURIComponent(input)}&limit=1`);
      const jsonSearch = await search.json();

      if (!jsonSearch.status || !jsonSearch.result?.search_data?.length) {
        return conn.sendMessage(m.chat, {
          text: `❌ No se encontraron resultados para: ${input}`,
          contextInfo
        }, { quoted: m });
      }

      finalUrl = jsonSearch.result.search_data[0].song_link;
    }

    // Descargar canción
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/spotify?url=${encodeURIComponent(finalUrl)}`);
    const json = await res.json();

    if (!json.status || !json.result?.download) {
      return conn.sendMessage(m.chat, {
        text: `❌ No se pudo obtener el audio de: ${input}`,
        contextInfo
      }, { quoted: m });
    }

    const data = json.result;
    const durationMin = Math.floor(data.duration_ms / 60000);
    const durationSec = Math.floor((data.duration_ms % 60000) / 1000).toString().padStart(2, '0');

    const caption = `
🎵 ${data.title}
👤 Artista: ${data.artists}
💿 Álbum: ${data.album}
📅 Lanzamiento: ${data.release_date}
⏱️ Duración: ${durationMin}:${durationSec}
🔗 Spotify: https://open.spotify.com/track/${data.id}
`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: data.cover_url },
      caption,
      contextInfo
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: data.download },
      fileName: `${data.title}.mp3`,
      mimetype: "audio/mp3",
      ptt: false,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error en Spotify Downloader:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 La melodía se desvaneció entre bambalinas...\n\n🛠️ ${e.message}`,
      contextInfo
    }, { quoted: m });
  }
};

handler.command = /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre o enlace de Spotify>'];

export default handler;