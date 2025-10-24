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
      text: `📺 ¿Qué video deseas recibir desde YouTube?\n\n📌 Uso command} <nombre o enlace>`,
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
    let videoUrl = input;

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
      videoUrl = first.link;

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

    const apiKey = 'rmF1oUJI529jzux8';
    const res = await fetch(`https://api-nv.ultraplus.click/api/youtube/v4?url=${encodeURIComponent(videoUrl)}&key=${apiKey}`);
    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);

    const json = await res.json();
    const result = json.result;

    if (!json.status || !result?.formats?.length) {
      throw new Error('No se pudo obtener el archivo de video. Verifica el enlace o intenta nuevamente.');
    }

    const videoFormat = result.formats.find(f => f.type === 'video' && f.url);
    if (!videoFormat) {
      throw new Error('No se encontró un formato de video válido.');
    }

    const caption = `✨ *${result.title}* ✨\n🎬 Fuente: Neveloopp\n🔗 Enlace directo: ${videoUrl}`;

    await conn.sendMessage(m.chat, {
      video: { url: videoFormat.url },
      caption,
      mimetype: 'video/mp4',
      fileName: 'video.mp4',
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

handler.command = /^play3$/i;
handler.tags = ['descargas'];
handler.help = ['play3 <nombre o enlace de YouTube>'];
handler.coin = 350;

export default handler;