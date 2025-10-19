import fetch from 'node-fetch';

const thumbnailUrl = 'https://qu.ax/Asbfq.jpg'; // Miniatura oficial

const contextInfo = {
  externalAdReply: {
    title: "🎬 YouTube Video",
    body: "Transmisión visual desde el universo musical...",
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
      text: `📺 ¿Qué video deseas recibir desde YouTube?\n\n📌 Uso: ${usedPrefix + command} <nombre o enlace>`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔍 Invocando el ritual visual...\n🎥 Buscando: ${input}`,
    contextInfo
  }, { quoted: m });

  try {
    const isUrl = input.includes("youtu");
    let finalQuery = input;

    if (!isUrl) {
      const search = await fetch(`https://sky-api-ashy.vercel.app/search/youtube?q=${encodeURIComponent(input)}`);
      const jsonSearch = await search.json();

      if (!jsonSearch.status || !jsonSearch.result?.length) {
        return conn.sendMessage(m.chat, {
          text: `❌ No se encontraron resultados para: ${input}`,
          contextInfo
        }, { quoted: m });
      }

      const first = jsonSearch.result[0];
      finalQuery = first.title;

      const caption = `✨ *${first.title}* ✨\n🎤 Canal: ${first.channel}\n⏱️ Duración: ${first.duration}\n🔗 Enlace: ${first.link}`;

      if (first.imageUrl) {
        await conn.sendMessage(m.chat, {
          image: { url: first.imageUrl },
          caption,
          contextInfo
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          text: caption,
          contextInfo
        }, { quoted: m });
      }
    }

    const res = await fetch(`https://api.vreden.my.id/api/v1/download/play/video?query=${encodeURIComponent(finalQuery)}`);
    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);

    const json = await res.json();
    const result = json.result;

    if (!json.status || !result?.download?.url) {
      throw new Error('No se pudo obtener el archivo de video. Verifica el nombre o intenta nuevamente.');
    }

    const caption = `✨ *${result.metadata.title}* ✨\n🎤 Autor: ${result.metadata.author.name}\n⏱️ Duración: ${result.metadata.timestamp}\n📅 Publicado: ${result.metadata.ago}\n👁️ Vistas: ${result.metadata.views.toLocaleString()}\n🔗 Enlace: ${result.metadata.url}`;

    await conn.sendMessage(m.chat, {
      video: { url: result.download.url },
      caption,
      mimetype: 'video/mp4',
      fileName: result.download.filename || 'video.mp4',
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error en YouTube Video Downloader:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 El telón no se levantó...\n\n🛠️ ${e.message}`,
      contextInfo
    }, { quoted: m });
  }
};

handler.command = /^playvideo$/i;
handler.tags = ['descargas'];
handler.help = ['playvideo <nombre o enlace de YouTube>'];
handler.coin = 350;

export default handler;