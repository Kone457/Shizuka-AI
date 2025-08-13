import fetch from 'node-fetch';

const SEARCH_API = 'https://api.vreden.my.id/api/yts?query=';
const STELLAR_API = 'https://api.stellarwa.xyz/dow/ytmp4?url=';
const STELLAR_KEYS = [
  'stellar-xI80Ci6e',
  'stellar-Gn3yNy3a',
  'stellar-PhpDeilZ',
  'stellar-DqKpmwws'
];
const MINIATURA_SHIZUKA = 'https://qu.ax/phgPU.jpg';

function elegirClaveAleatoria() {
  return STELLAR_KEYS[Math.floor(Math.random() * STELLAR_KEYS.length)];
}

const contextInfo = {
  externalAdReply: {
    title: "🎬 Sello de Shizuka",
    body: "Transmisión escénica desde el imperio digital...",
    mediaType: 1,
    previewType: 0,
    mediaUrl: "https://youtube.com",
    sourceUrl: "https://youtube.com",
    thumbnailUrl: MINIATURA_SHIZUKA
  }
};

async function invocarBusqueda(query) {
  try {
    const res = await fetch(SEARCH_API + encodeURIComponent(query));
    if (!res.ok) return null;
    const json = await res.json();
    return json.result?.all?.[0] || null;
  } catch {
    return null;
  }
}

async function invocarDescarga(videoUrl) {
  const clave = elegirClaveAleatoria();
  const fullUrl = `${STELLAR_API}${encodeURIComponent(videoUrl)}&apikey=${clave}`;
  try {
    const res = await fetch(fullUrl);
    if (!res.ok) return null;
    const json = await res.json();
    return json.status ? json.data : null;
  } catch {
    return null;
  }
}

let handler = async (m, { text, conn, command }) => {
  const enviarMiniatura = async (caption) => {
    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo
    }, { quoted: m });
  };

  if (!text) {
    return enviarMiniatura(`🔮 *Invocación incompleta*\nEscribe el nombre del video que deseas conjurar.\nEjemplo: *.play2 Usewa Ado*`);
  }

  try {
    const video = await invocarBusqueda(text);
    if (!video) {
      return enviarMiniatura(`⚠️ *Resultado vacío*\nNo se encontraron visiones para tu búsqueda. Intenta con otro título.`);
    }

    const { title, url, seconds, views, author } = video;
    const nombreAutor = author?.name || 'Desconocido';

    const mensajeCeremonial = `
🎀 *Sello de Shizuka activado*

🎬 『${title}』
⏱️ ${seconds}s | 👁️ ${views.toLocaleString()}
🧑‍🎤 ${nombreAutor}
🔗 ${url}
🌐 StellarWA (clave rotativa)
    `.trim();

    await enviarMiniatura(mensajeCeremonial);

    const descarga = await invocarDescarga(url);
    if (!descarga || !descarga.dl) {
      return enviarMiniatura(`❌ *Descarga fallida*\nEl portal Stellar no respondió. Intenta nuevamente bajo otra luna.`);
    }

    await conn.sendMessage(m.chat, {
      video: { url: descarga.dl },
      mimetype: 'video/mp4',
      fileName: descarga.title || 'video.mp4',
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    return enviarMiniatura(`💥 *Error ritual*\nHubo una interrupción en el flujo ceremonial. Reintenta la invocación con energía renovada.`);
  }
};

handler.command = ['play2', 'mp4', 'playmp4'];
handler.help = ['play2 <video>'];
handler.tags = ['downloader'];
export default handler;