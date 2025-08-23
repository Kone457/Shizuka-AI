import fetch from 'node-fetch';

const API_VREDEN = 'https://api.vreden.my.id/api/ytplaymp4?query=';
const MINIATURA_SHIZUKA = 'https://qu.ax/phgPU.jpg';

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

async function invocarVision(query) {
  try {
    const res = await fetch(API_VREDEN + encodeURIComponent(query));
    if (!res.ok) return null;
    const json = await res.json();
    return json.result?.metadata && json.result?.download?.status ? json.result : null;
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
    return enviarCeremonia(`🔮 Invocación incompleta\nEscribe el nombre del video que deseas conjurar.\nEjemplo: .play3 DJ Malam Pagi`);
  }

  try {
    const resultado = await invocarVision(text);
    if (!resultado) {
      return enviarCeremonia(`⚠️ Visión fallida\nNo se pudo abrir el portal de Vreden. Intenta con otro título o bajo otra luna.`);
    }

    const { metadata, download } = resultado;
    const { title, url, seconds, views, author } = metadata;
    const nombreAutor = author?.name || 'Desconocido';

    const mensajeCeremonial = `
🎀 Sello de Shizuka activado

🎬 『${title}』
⏱️ ${seconds}s | 👁️ ${views.toLocaleString()}
🧑‍🎤 ${nombreAutor}
🔗 ${url}
🌐 Calidad: ${download.quality}
    `.trim();

    await enviarCeremonia(mensajeCeremonial);

    await conn.sendMessage(m.chat, {
      video: { url: download.url },
      mimetype: 'video/mp4',
      fileName: download.filename || 'video.mp4',
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    return enviarCeremonia(`💥 Error ritual\nHubo una interrupción en el flujo ceremonial. Reintenta la invocación con energía renovada.`);
  }
};

handler.command = ['play2', 'ytmp4', 'playmp4'];
handler.help = ['play2 <video>'];
handler.tags = ['downloader'];
export default handler;