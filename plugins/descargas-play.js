import fetch from 'node-fetch';

const thumbnailUrl = 'https://qu.ax/QuwNu.jpg'; // Miniatura oficial (opcional)

const contextInfo = {
  externalAdReply: {
    title: "🎧 Spotify Music",
    body: "Reproducción directa desde Spotify...",
    mediaType: 1,
    previewType: 0,
    mediaUrl: "https://spotify.com",
    sourceUrl: "https://spotify.com",
    thumbnailUrl
  }
};

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const input = args.join(" ").trim();
  if (!input) {
    return conn.sendMessage(m.chat, {
      text: `🎼 ¿Qué deseas escuchar en Spotify?\n\n📌 Uso: ${usedPrefix + command} <nombre o enlace>`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 Buscando en Spotify...\n🎵 Cargando resultados de: ${input}`,
    contextInfo
  }, { quoted: m });

  try {
    const isUrl = input.includes("spotify.com/track/");
    let finalUrl = isUrl ? input : null;

    // 🔎 Buscar en Spotify
    if (!isUrl) {
      const search = await fetch(`https://api.vreden.my.id/api/v2/search/spotify?query=${encodeURIComponent(input)}`);
      const jsonSearch = await search.json();

      if (!jsonSearch.status || !jsonSearch.result?.search_data?.length) {
        return conn.sendMessage(m.chat, {
          text: `❌ No se encontraron resultados para: ${input}`,
          contextInfo
        }, { quoted: m });
      }

      finalUrl = jsonSearch.result.search_data[0].song_link;
    }

    // 📥 Descargar canción
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/spotify?url=${encodeURIComponent(finalUrl)}`);
    const json = await res.json();

    if (!json.status || !json.result?.download) {
      return conn.sendMessage(m.chat, {
        text: `❌ No se pudo obtener el audio de: ${input}`,
        contextInfo
      }, { quoted: m });
    }

    const data = json.result;

    const duration = `${Math.floor(data.duration_ms / 60000)}:${Math.floor((data.duration_ms % 60000) / 1000).toString().padStart(2, '0')}`;

    const caption = `
🎼 *${data.title}*
👤 Artista: ${data.artists}
💽 Álbum: ${data.album}
📅 Lanzamiento: ${data.release_date}
⏱️ Duración: ${duration}
🔗 Spotify: https://open.spotify.com/track/${data.id}
`.trim();

    // 📸 Enviar portada con info
    await conn.sendMessage(m.chat, {
      image: { url: data.cover_url },
      caption,
      contextInfo
    }, { quoted: m });

    // 🎶 Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: data.download },
      fileName: `${data.title}.mp3`,
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error en Spotify Downloader:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 Hubo un error inesperado...\n\n🛠️ ${e.message || JSON.stringify(e)}`,
      contextInfo
    }, { quoted: m });
  }
};

handler.command = /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre o enlace de Spotify>'];

export default handler;