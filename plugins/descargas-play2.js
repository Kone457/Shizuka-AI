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
    const isUrl = input.includes("youtu");
    let finalUrl = input;

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
      finalUrl = first.link;

      const caption = `🎬 *${first.title}*\n📺 Canal: ${first.channel}\n⏱️ Duración: ${first.duration}\n🔗 Enlace: ${first.link}`;

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

    
    const apiKey = 'rmF1oUJI529jzux8';
    const res = await fetch(`https://api-nv.ultraplus.click/api/youtube/v2?url=${encodeURIComponent(finalUrl)}&format=video&key=${apiKey}`);
    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);

    const jsonResponse = await res.json();
    if (!jsonResponse.status || !jsonResponse.result?.dl) {
      throw new Error('No se pudo obtener el archivo de video. Verifique el enlace o intente nuevamente.');
    }

    const videoUrl = jsonResponse.result.dl;
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Código HTTP ${videoRes.status}`);
    const buffer = await videoRes.buffer();

    await conn.sendMessage(m.chat, {
      video: buffer,
      mimetype: 'video/mp4',
      fileName: jsonResponse.result.title || 'video.mp4',
      caption: `🎥 *${jsonResponse.result.title}*`,
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

handler.command = /^play3$/i;
handler.tags = ['descargas'];
handler.help = ['play3 <nombre o enlace de YouTube>'];
handler.coin = 300;

export default handler;