import fetch from 'node-fetch';

const SEARCH_API = 'https://api.vreden.my.id/api/yts?query=';
const STELLAR_API = 'https://api.stellarwa.xyz/dow/ytmp4?url=';
const STELLAR_KEYS = [
  'stellar-xI80Ci6e',
  'stellar-Gn3yNy3a',
  'stellar-PhpDeilZ',
  'stellar-DqKpmwws'
]; // ← Añade aquí todas tus llaves ceremoniales
const MINIATURA_SHIZUKA = 'https://qu.ax/diNXY.jpg';

function elegirClaveAleatoria() {
  return STELLAR_KEYS[Math.floor(Math.random() * STELLAR_KEYS.length)];
}

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
  if (!text) {
    return conn.sendMessage(m.chat, {
      image: { url: MINIATURA_SHIZUKA },
      caption: `🔮 *Invocación incompleta*\n\nPor favor, escribe el nombre del video que deseas conjurar.\nEjemplo: *.play2 Usewa Ado*`
    }, { quoted: m });
  }

  try {
    const video = await invocarBusqueda(text);
    if (!video) {
      return conn.sendMessage(m.chat, {
        image: { url: MINIATURA_SHIZUKA },
        caption: `⚠️ *Resultado vacío*\n\nNo se encontraron visiones para tu búsqueda. Intenta con otro título, viajero de las ondas.`
      }, { quoted: m });
    }

    const { thumbnail, title, url, seconds, views, author } = video;
    const nombreAutor = author?.name || 'Desconocido';

    const mensajeCeremonial = `
🎀 *Sello de Shizuka activado*

🎬 *Título:* 『${title}』
⏱️ *Duración:* ${seconds}s
👁️ *Vistas:* ${views.toLocaleString()}
🧑‍🎤 *Autor:* ${nombreAutor}
🔗 *Enlace:* ${url}
🌐 *Servidor:* StellarWA (clave rotativa)

🪄 *Preparando descarga ceremonial...*
    `.trim();

    await conn.sendMessage(m.chat, {
      image: { url: MINIATURA_SHIZUKA },
      caption: mensajeCeremonial
    }, { quoted: m });

    const descarga = await invocarDescarga(url);
    if (!descarga || !descarga.dl) {
      return conn.sendMessage(m.chat, {
        image: { url: MINIATURA_SHIZUKA },
        caption: `❌ *Descarga fallida*\n\nEl portal Stellar se ha cerrado sin entregar el archivo. Intenta nuevamente bajo otra luna.`
      }, { quoted: m });
    }

    await conn.sendMessage(m.chat, {
      video: { url: descarga.dl },
      mimetype: 'video/mp4',
      fileName: descarga.title || 'video.mp4'
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    return conn.sendMessage(m.chat, {
      image: { url: MINIATURA_SHIZUKA },
      caption: `💥 *Error ritual*\n\nHubo una interrupción en el flujo ceremonial. Reintenta la invocación con energía renovada.`
    }, { quoted: m });
  }
};

handler.command = ['play2', 'mp4', 'ytmp4', 'playmp4'];
handler.help = ['play2 <video>'];
handler.tags = ['downloader'];
export default handler;