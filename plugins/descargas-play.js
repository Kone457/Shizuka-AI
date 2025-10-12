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
    text: `🔎 Procesando tu petición...\n🎵 Buscando: ${input}`,
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

    
    const apiKey = 'AdonixKey66b2xl3900';
    const res = await fetch(`https://api-adonix.ultraplus.click/download/ytmp3?apikey=${apiKey}&url=${encodeURIComponent(finalUrl)}`);
    if (!res.ok) throw new Error(`Código HTTP ${res.status}`);

    const jsonResponse = await res.json();
    if (jsonResponse.status !== "true" || !jsonResponse.data?.url) {
      throw new Error('No se pudo obtener el archivo de audio. Verifique el enlace o intente nuevamente.');
    }

    const audioUrl = jsonResponse.data.url;
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new Error(`Código HTTP ${audioRes.status}`);
    const buffer = await audioRes.buffer();

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: jsonResponse.data.title || 'audio.mp3',
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