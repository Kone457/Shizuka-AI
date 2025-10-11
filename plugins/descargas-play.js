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
          text: `❌ No se encontraron resultados para contextInfo
        }, { quoted: m });
      }
      finalUrl = jsonSearch.data[0].url;
    }

    // 🎶 Descargar audio con la nueva API directa
    const apiKey = 'rmF1oUJI529jzux8';
    const res = await fetch(
      `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(finalUrl)}&type=audio&key=${apiKey}`
    );

    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();

    await conn.sendMessage(m.chat, {
      audio: { buffer },
      fileName: 'Shizuka-Audio.mp3',
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
<nombre o enlace de YouTube>'];
handler.coin = 250;

export default handler;