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
    let videoUrl = input;
    let title = input;

    // Si no es una URL, buscar el video
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
      videoUrl = first.link;
      title = first.title;

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

    // Llamada a la API para obtener los enlaces de descarga
    const apiKey = 'rmF1oUJI529jzux8';
    const apiUrl = `https://api-nv.ultraplus.click/api/youtube/v4?url=${encodeURIComponent(videoUrl)}&key=${apiKey}`;

    console.log("API Request URL:", apiUrl); // Agregar log para depurar

    // Realizamos la solicitud a la API de descarga
    const apiResponse = await fetch(apiUrl);
    const apiData = await apiResponse.json();

    // Verificamos la respuesta de la API
    if (!apiData.status) {
      throw new Error('No se pudo obtener el video o el enlace está roto.');
    }

    // Obtenemos el enlace de descarga (360p)
    const videoData = apiData.result.formats.find(f => f.quality === '360p' && f.type === 'video');

    if (!videoData) {
      throw new Error('No se encontró una opción de descarga en 360p.');
    }

    // Preparamos el mensaje con la URL de descarga
    const caption = `✨ *${title}* ✨\n📡 Fuente directa: Neveloopp\n🔗 Enlace original: ${videoUrl}`;

    await conn.sendMessage(m.chat, {
      video: { url: videoData.url }, // Aquí usamos el enlace de descarga en 360p
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