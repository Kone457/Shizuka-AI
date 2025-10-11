import fetch from 'node-fetch';

const SEARCH_API = 'https://delirius-apiofc.vercel.app/search/ytsearch?q=';
const DOWNLOAD_API = 'https://api.stellarwa.xyz/dow/ytmp4';
const MINIATURA_SHIZUKA = 'https://qu.ax/phgPU.jpg';
const API_KEY = 'stellar-MUdpZwW6';

const contextInfo = {
  externalAdReply: {
    title: "Shizuka",
    body: "Transmisión escénica desde el imperio digital...",
    mediaType: 1,
    previewType: 0,
    mediaUrl: "https://youtube.com",
    sourceUrl: "https://youtube.com",
    thumbnailUrl: MINIATURA_SHIZUKA
  }
};

async function buscarVideo(query) {
  try {
    const res = await fetch(SEARCH_API + encodeURIComponent(query));
    if (!res.ok) return null;
    const json = await res.json();
    return json.status && json.data && json.data.length > 0 ? json.data[0] : null;
  } catch {
    return null;
  }
}

async function descargarVideo(videoUrl) {
  const endpoint = `${DOWNLOAD_API}?url=${encodeURIComponent(videoUrl)}&apikey=${API_KEY}`;
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    const json = await res.json();
    return json.status && json.data?.dl ? json.data : null;
  } catch {
    return null;
  }
}

let handler = async (m, { text, conn, command }) => {
  const enviarCeremonia = async (mensaje) => {
    const marco = `╭─━━━━━━༺༻━━━━━━─╮\n${mensaje}\n╰─━━━━━━༺༻━━━━━━─╯`;
    await conn.sendMessage(m.chat, {
      text: marco,
      contextInfo
    }, { quoted: m });
  };

  if (!text) {
    return enviarCeremonia(`🔮 Invocación incompleta\nEscribe el nombre del video que deseas conjurar.\nEjemplo: .${command} Ambatukam Termuwani`);
  }

  try {
    const vision = await buscarVideo(text);
    if (!vision) {
      return enviarCeremonia(`⚠️ Visión fallida\nNo se encontraron portales abiertos para tu búsqueda.`);
    }

    const { title, url, duration, views, author } = vision;
    const nombreAutor = author?.name || "Desconocido";

    const mensajeCeremonial = `
🎀 Sello de Shizuka activado

🎬 『${title}』
⏱️ ${duration} | 👁️ ${views.toLocaleString()}
🧑‍🎤 ${nombreAutor}
🔗 ${url}
    `.trim();

    await enviarCeremonia(mensajeCeremonial);

    const descarga = await descargarVideo(url);
    if (!descarga) {
      return enviarCeremonia(`❌ Portal cerrado\nLa conversión de 『${title}』 falló. Intenta nuevamente bajo otra luna.`);
    }

    await conn.sendMessage(m.chat, {
      video: { url: descarga.dl },
      mimetype: 'video/mp4',
      fileName: `${descarga.title || title}.mp4`,
      caption: `🎬 ${descarga.title || title}`,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    return enviarCeremonia(`💥 Error ritual\nHubo una interrupción en el flujo ceremonial. Reintenta la invocación con energía renovada.`);
  }
};

handler.command = ['play2'];
handler.help = ['play2 <video>'];
handler.tags = ['downloader'];
handler.coin = 500;

export default handler;
