import fetch from 'node-fetch';

const SEARCH_APIS = [
  { name: 'Servidor Masha', url: 'http://api.alyabot.xyz:3269/search_youtube?query=' },
  { name: 'Servidor Alya', url: 'http://api2.alyabot.xyz:5216/search_youtube?query=' },
  { name: 'Servidor Masachika', url: 'https://api3.alyabot.xyz/search_youtube?query=' }
];

const DOWNLOAD_APIS = [ // Array for iteration
  { name: 'Servidor Masha', url: 'https://myapiadonix.vercel.app/api/ytmp4=' },
  { name: 'Servidor Alya', url: 'http://api2.alyabot.xyz:5216/download_video?url=' },
  { name: 'Servidor Masachika', url: 'https://api3.alyabot.xyz/download_video?url=' }
];

/**
 * Tries to fetch JSON data from a list of servers until one succeeds.
 * @param {Array<Object>} servers - An array of server objects with 'name' and 'url' properties.
 * @param {string} query - The query string to encode and append to the URL.
 * @returns {Promise<{json: Object|null, serverName: string|null}>} - The JSON data and the name of the server that succeeded, or nulls if none succeeded.
 */
async function tryFetchJSON(servers, query) {
  for (const server of servers) {
    try {
      const res = await fetch(server.url + encodeURIComponent(query));
      if (!res.ok) {
        // console.warn(`DEBUG: Servidor de búsqueda falló con estado: ${res.status}`); // For debugging
        continue;
      }
      const json = await res.json();
      if (json && Object.keys(json).length) {
        return { json, serverName: server.name };
      }
    } catch (error) {
      // console.error(`DEBUG: Error en tryFetchJSON para búsqueda:`, error); // For debugging
      continue;
    }
  }
  return { json: null, serverName: null };
}

const handler = async (m, { text, conn }) => {
  if (!text) {
    return conn.reply(m.chat, `🔎 *¿Qué video deseas descargar?*\nEscribe el nombre o link del video.`, m);
  }

  try {
    // --- Initial Search Message with External Ad Reply ---
    await conn.sendMessage(m.chat, {
      text: `🔭 *Shizuka está buscando tu video...*`,
      contextInfo: {
        externalAdReply: {
          title: "🎬 Explorando YouTube...",
          body: "⏳ Un momento...",
          thumbnailUrl: "https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Shizuka.jpg",
          mediaType: 1,
          previewType: 0,
          mediaUrl: "https://youtube.com",
          sourceUrl: "https://youtube.com",
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // --- Search for the video ---
    const { json: searchJson, serverName: searchServer } = await tryFetchJSON(SEARCH_APIS, text);

    if (!searchJson || !searchJson.results?.length) {
      return conn.reply(m.chat, '⚠️ *No se encontraron resultados para tu búsqueda.*', m);
    }

    const video = searchJson.results[0];
    const thumb = video.thumbnails?.find(t => t.width >= 720)?.url || video.thumbnails?.[0]?.url;
    const title = video.title || 'Sin título';
    const url = video.url;
    const duration = video.duration ? `${Math.floor(video.duration)}s` : 'Desconocido';
    const views = video.views?.toLocaleString() || 'Desconocido';
    const canal = video.channel || 'Desconocido';

    // --- Video Info Message with Original Styling (External Ad Reply) ---
    const info = `
🎞️ *${title}*
👤 *Canal:* ${canal}
⏱️ *Duración:* ${duration}
👁️ *Vistas:* ${views}
🔗 *Link:* ${url}
`.trim();

    await conn.sendMessage(m.chat, {
      text: info,
      contextInfo: {
        externalAdReply: {
          title: "🎬 Shizuka Video",
          body: "🎁 Preparando el MP4 para ti...",
          thumbnailUrl: thumb,
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // --- Download Attempt Loop ---
    let downloadUrl = null;
    for (const downloadServer of DOWNLOAD_APIS) {
      try {
        const res = await fetch(downloadServer.url + encodeURIComponent(url));

        if (!res.ok) {
          // console.error(`DEBUG: Un servidor de descarga falló con estado: ${res.status}`); // For debugging
          continue; // Try next server
        }

        const json = await res.json();
        downloadUrl = json.download_url || json.result?.url || json.url || json.data?.url;

        if (downloadUrl) {
          break; // Found a URL, exit loop
        }
      } catch (e) {
        // console.error(`DEBUG: Error al intentar descargar de un servidor:`, e); // For debugging
      }
    }

    if (!downloadUrl) {
      return conn.reply(m.chat, '🚫 *No se pudo obtener el enlace de descarga del video desde ningún servidor disponible.*', m);
    }

    // --- Send the video ---
    await conn.sendMessage(m.chat, {
      video: { url: downloadUrl },
      fileName: `${title}.mp4`,
      mimetype: 'video/mp4'
    }, { quoted: m });

  } catch (e) {
    console.error("❌ Error en play2:", e);
    return conn.reply(m.chat, `❌ *Ocurrió un error inesperado al procesar el video.*\n${e.message || e}`, m);
  }
};

handler.command = /^play2|mp4|ytmp4|ytv$/i;
handler.help = ['play2 <nombre del video>'];
handler.tags = ['descargas'];

export default handler;
