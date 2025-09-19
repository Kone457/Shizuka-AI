import fetch from 'node-fetch';

const thumbnailUrl = 'https://qu.ax/QuwNu.jpg'; // Miniatura oficial

const contextInfo = {
  externalAdReply: {
    title: "🎶 SoundCloud Ritual",
    body: "Exploración sonora desde las nubes...",
    mediaType: 1,
    previewType: 0,
    mediaUrl: "https://soundcloud.com",
    sourceUrl: "https://soundcloud.com",
    thumbnailUrl
  }
};

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const input = args.join(" ").trim();
  if (!input) {
    return conn.sendMessage(m.chat, {
      text: `🌥️ ¿Qué deseas escuchar en SoundCloud?\n\n📌 Uso: ${usedPrefix + command} <nombre o enlace de playlist>`,
      contextInfo
    }, { quoted(m.chat, {
    text: `🔎 Invocando ecos desde SoundCloud...\n🎵 Procesando: ${input}`,
    contextInfo
  }, { quoted: m });

  try {
    const isPlaylist = input.includes("soundcloud.com/") && input.includes("/sets/");
    if (isPlaylist) {
      // Modo playlist
      const res = await fetch(`https://apis-starlights-team.koyeb.app/starlight/soundcloud-playlist?url=${encodeURIComponent(input)}`);
      const json = await res.json();

      if (!json.tracks || json.tracks.length === 0) {
        return conn.sendMessage(m.chat, {
          text: `❌ No se encontraron pistas en la playlist.`,
          contextInfo
        }, { quoted: m });
      }

      const caption = `
🎼 Playlist: ${json.title}
👤 Creador: ${json.owner}
📅 Publicado: ${new Date(json.published).toLocaleDateString()}
👥 Seguidores: ${json.followers.toLocaleString()}
🔗 Enlace: ${json.url}
`.trim();

      await conn.sendMessage(m.chat, {
        image: { url: json.thumb },
        caption,
        contextInfo
      }, { quoted: m });

      for (const track of json.tracks) {
        await conn.sendMessage(m.chat, {
          audio: { url: track.url },
          fileName: track.title + ".mp3",
          mimetype: "audio/mp4",
          ptt: false,
          contextInfo
        }, { quoted: m });
      }

    } else {
      // Modo búsqueda
      const res = await fetch(`https://apis-starlights-team.koyeb.app/starlight/soundcloud-search?text=${encodeURIComponent(input)}`);
      const json = await res.json();

      if (!Array.isArray(json) || json.length === 0) {
        return conn.sendMessage(m.chat, {
          text: `❌ No se encontraron resultados para "${input}".`,
          contextInfo
        }, { quoted: m });
      }

      const track = json[0]; // Primer resultado

      const caption = `
🎧 ${track.title}
👤 Artista: ${track.artist}
📈 Reproducciones: ${track.repro}
⏱️ Duración: ${track.duration}
🔗 Enlace: ${track.url}
`.trim();

      await conn.sendMessage(m.chat, {
        image: { url: track.image },
        caption,
        contextInfo
      }, { quoted: m });
    }

  } catch (e) {
    console.error("⚠️ Error en SoundCloud:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 El sonido se perdió entre las nubes...\n\n🛠️ ${e.message}`,
      contextInfo
    }, { quoted: m });
  }
};

handler.command = /^soundcloud$/i;
handler.tags = ['soundcloud'];
handler.help = ['soundcloud <nombre o enlace de playlist>'];

export default handler;