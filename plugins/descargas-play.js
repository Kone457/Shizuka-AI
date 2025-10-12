import fetch from 'node-fetch';

const thumbnailUrl = 'https://qu.ax/QuwNu.jpg'; // Miniatura oficial

const contextInfo = {
  externalAdReply: {
    title: "🎧 YouTube Music",
    body: "Reproducción directa desde el universo musical...",
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
      text: `🎬 ¿Qué deseas escuchar en YouTube?\n\n📌 Uso: ${usedPrefix + command} <nombre o enlace>`,
      contextInfo
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    text: `🔎 Procesando tu petición...\n🎵 Cargando resultados de ${input}`,
    contextInfo
  }, { quoted: m });

  try {
    const isUrl = input.includes("youtu");
    let finalUrl = isUrl ? input : null;

    if (!isUrl) {
      const search = await fetch(
        `https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(input)}`
      );
      const jsonSearch = await search.json();
      if (!jsonSearch.status || !jsonSearch.data?.length) {
        return conn.sendMessage(m.chat, {
          text: `❌ No se encontraron resultados para ${input}.`,
          contextInfo
        }, { quoted: m });
      }
      finalUrl = jsonSearch.data[0].url;
    }

    // Usamos la nueva API para obtener el enlace de descarga
    const apiKey = 'rmF1oUJI529jzux8';
    const res = await fetch(
      `https://api-nv.ultraplus.click/api/youtube/v2?url=${encodeURIComponent(finalUrl)}&format=audio&key=${apiKey}`
    );

    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);
    const jsonResponse = await res.json();

    if (!jsonResponse.status) {
      throw new Error('No se pudo obtener el archivo de audio.');
    }

    const audioUrl = jsonResponse.result.dl;

    // Descargar el audio
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new Error(`Código HTTP ${audioRes.status}`);
    const buffer = await audioRes.buffer();

    await conn.sendMessage(m.chat, {
      audio: { buffer },
      fileName: jsonResponse.result.title || 'audio.mp3',
      mimetype: 'audio/mp4',
      ptt: false,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("⚠️ Error en YouTube Downloader:", e);
    await conn.sendMessage(m.chat, {
      text: `🎭 La transmisión se desvaneció entre bambalinas...\n\n🛠️ ${e.message}`,
      contextInfo
    }, { quoted: m });
  }
};

handler.command = /^play$/i;
handler.tags = ['descargas'];
handler.help = ['play <nombre o enlace de YouTube>'];
handler.coin = 250;

export default handler;