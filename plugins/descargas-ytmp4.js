import fetch from 'node-fetch';

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
    title: "📡 Ritual de descarga",
    body: "Transmisión directa desde el imperio digital...",
    mediaType: 1,
    previewType: 0,
    mediaUrl: "https://youtube.com",
    sourceUrl: "https://youtube.com",
    thumbnailUrl: MINIATURA_SHIZUKA
  }
};

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

  if (!text || !text.includes('youtube.com') && !text.includes('youtu.be')) {
    return enviarMiniatura(`🔗 *Invocación inválida*\nDebes entregar un enlace de YouTube para que el ritual se complete.\nEjemplo: *.ytmp4 https://youtu.be/abc123*`);
  }

  try {
    const descarga = await invocarDescarga(text);
    if (!descarga || !descarga.dl) {
      return enviarMiniatura(`❌ *Descarga fallida*\nEl portal Stellar no respondió. Intenta nuevamente bajo otra luna.`);
    }

    const mensajeCeremonial = `
🎥 *Descarga ceremonial completada*

📜 『${descarga.title || 'Video sin título'}』
📦 Tamaño: ${descarga.size || 'Desconocido'}
🔗 Enlace original: ${text}
🌐 Portal: StellarWA
    `.trim();

    await enviarMiniatura(mensajeCeremonial);

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

handler.command = ['ytmp4'];
handler.help = ['ytmp4 <link de YouTube>'];
handler.tags = ['downloader'];
export default handler;