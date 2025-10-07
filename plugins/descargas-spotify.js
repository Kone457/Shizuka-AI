import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const thumbnailCard = 'https://qu.ax/phgPU.jpg';
  
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🎵 *Escribe el nombre de una canción o pega el enlace de Spotify.*\nEjemplo:\n${usedPrefix + command} DJ Opus`,
      footer: '🔍 Buscar y descargar vía Vreden API',
      contextInfo: {
        externalAdReply: {
          title: 'Spotify Downloader',
          body: 'Busca una canción por nombre o link',
          thumbnailUrl: thumbnailCard,
          sourceUrl: 'https://api.vreden.my.id'
        }
      }
    }, { quoted: m });
  }

  let trackUrl;

  // Detectar si es enlace válido de Spotify
  const isSpotifyLink = text.includes('spotify.com/track');

  if (isSpotifyLink) {
    trackUrl = text.trim();
  } else {
    // Buscar por nombre
    const searchUrl = `https://api.vreden.my.id/api/spotifysearch?query=${encodeURIComponent(text)}`;
    const searchRes = await fetch(searchUrl);
    const searchJson = await searchRes.json();

    if (!searchJson?.result || !searchJson.result[0]) {
      return m.reply(`❌ No se encontró ninguna canción con el término: ${text}`);
    }

    trackUrl = searchJson.result[0].spotifyLink;
  }

  try {
    const infoRes = await fetch(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(trackUrl)}`);
    const trackData = await infoRes.json();
    const track = trackData.result;

    if (!track?.status || !track.music) {
      return m.reply(`⚠️ No se pudo obtener datos válidos del track.`);
    }

    const audioRes = await fetch(track.music);
    const audioBuffer = await audioRes.buffer();

    // Enviar información del track con imagen
    await conn.sendMessage(m.chat, {
      image: { url: track.cover || thumbnailCard },
      caption: `🎶 *${track.title}*\n👤 Artista: ${track.artists}\n📀 Tipo: ${track.type}\n📅 Lanzamiento: ${track.releaseDate || 'No disponible'}\n🎧 Enviando audio...`,
      footer: '🟢 Extraído vía Vreden API',
      contextInfo: {
        externalAdReply: {
          title: track.title,
          body: 'Click para escuchar o descargar',
          thumbnailUrl: thumbnailCard,
          sourceUrl: track.music
        }
      }
    }, { quoted: m });

    // Enviar audio en formato MP3
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${track.title}.mp3`
    }, { quoted: m });

  } catch (err) {
    console.error('❌ Error:', err);
    m.reply(`💥 Ocurrió un error al procesar la solicitud.\n📛 ${err.message}`);
  }
};

handler.command = ['spotify', 'trackvreden', 'songcard', 'buscaspotify'];
handler.coin = 200;
export default handler;