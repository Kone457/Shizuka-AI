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
  const text = args.join(" ").trim();
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🌥️ ¿Qué deseas escuchar en SoundCloud?\n\n📌 Uso: ${usedPrefix + command} <nombre de canción/artista>`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 Buscando en SoundCloud...\n🎵 Cargando resultados de ${text}`,
    contextInfo
  }, { quoted: m });

  try {
    const res = await fetch(`https://apis-starlights-team.koyeb.app/starlight/soundcloud-search?text=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!Array.isArray(json) || json.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `❌ No se encontraron resultados para "${text}".`,
        contextInfo
      }, { quoted: m });
    }

    const track = json[0]; // Primer resultado

    const caption = `
🎧 ${track.title}
👤 Artista: ${track.artist}
📈 Reproducciones: ${track.repro}
⏱️ Duración: ${track.duration}
🔗 SoundCloud: ${track.url}
`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: track.image },
      caption,
      contextInfo
    }, { quoted: m });

    // Si quieres reproducir directamente el audio, puedes usar un convertidor externo aquí
    // o simplemente dejar el enlace como ritual de acceso.

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
handler.help = ['soundcloud <nombre de canción/artista>'];
handler.coin = 200;
export default handler;