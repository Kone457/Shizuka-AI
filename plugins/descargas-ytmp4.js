import fetch from 'node-fetch';

const DOWNLOAD_API = 'https://api-nv.ultraplus.click/api/dl/yt-direct';
const MINIATURA_SHIZUKA = 'https://qu.ax/phgPU.jpg';
const API_KEY = 'rmF1oUJI529jzux8';

const contextInfo = {
  externalAdReply: {
    title: "Shizuka",
    body: "Descarga directa desde el imperio digital...",
    mediaType: 1,
    previewType: 0,
    mediaUrl: "https://youtube.com",
    sourceUrl: "https://youtube.com",
    thumbnailUrl: MINIATURA_SHIZUKA
  }
};

async function generarEnlaceDescarga(videoUrl) {
  const tipo = 'video';
  return `${DOWNLOAD_API}?url=${encodeURIComponent(videoUrl)}&type=${tipo}&key=${API_KEY}`;
}

let handler = async (m, { text, conn, command }) => {
  const enviarCeremonia = async (mensaje) => {
    const marco = `╭─━━━━━━༺༻━━━━━━─╮\n${mensaje}\n╰─━━━━━━༺༻━━━━━━─╯`;
    await conn.sendMessage(m.chat, {
      text: marco,
      contextInfo
    }, { quoted: m });
  };

  if (!text || !text.includes('youtube.com') && !text.includes('youtu.be')) {
    return enviarCeremonia(`🔗 Enlace faltante\nEnvía un link válido de YouTube para abrir el portal.\nEjemplo: .${command} https://youtu.be/Q1Hta4K6qVM`);
  }

  try {
    const descarga = await generarEnlaceDescarga(text);
    if (!descarga) {
      return enviarCeremonia(`❌ Portal cerrado\nNo se pudo abrir el enlace. Intenta con otro video o bajo otra luna.`);
    }

    await enviarCeremonia(`🎀 Sello de Shizuka activado\n🔗 ${text}`);

    await conn.sendMessage(m.chat, {
      video: { url: descarga },
      mimetype: 'video/mp4',
      fileName: 'Shizuka-Invocación.mp4',
      caption: `🎬 Invocación directa desde el imperio digital`,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    return enviarCeremonia(`💥 Error ritual\nHubo una interrupción en el flujo ceremonial. Reintenta la invocación con energía renovada.`);
  }
};

handler.command = ['ytmp4'];
handler.help = ['ytmp4 <link de YouTube>'];
handler.tags = ['downloader'];
handler.coin = 300;

export default handler;