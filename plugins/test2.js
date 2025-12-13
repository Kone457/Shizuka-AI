import fetch from 'node-fetch';
import cheerio from 'cheerio';

const BASE = "https://animeav1.com";

// --- FUNCIONES DE EXTRACCIÓN (Mantenidas ya que funcionan bien) ---

async function getAnime(query) {
  const url = `${BASE}/catalogo?search=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: BASE,
    },
  });

  if (!res.ok) throw new Error("Error al buscar anime");

  const text = await res.text();
  const $ = cheerio.load(text);
  const firstResult = $("article").first();
  if (!firstResult.length) throw new Error("Anime no encontrado");

  const path = firstResult.find("a.absolute.inset-0").attr("href");
  if (!path) throw new Error("URL del anime no encontrada");

  const episodesList = await getEpisodes(BASE + path);

  return {
    status: true,
    creator: "neveloopp",
    url: BASE + path,
    title: firstResult.find("h3").text().trim(),
    type: firstResult.find(".text-xs.font-bold.text-subs").text().trim(),
    image: firstResult.find("img").attr("src"),
    description: firstResult.find("p").text().trim() || null,
    episodios: episodesList.length,
    episodesList,
    searchQuery: query, // Agregamos la query de búsqueda
  };
}

async function getEpisodes(animeUrl) {
  const res = await fetch(animeUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: BASE,
    },
  });

  const data = await res.text();
  const $ = cheerio.load(data);
  const eps = [];
  const seen = new Set();

  $("a.absolute.inset-0").each((i, el) => {
    const path = $(el).attr("href");
    if (!path) return;
    const match = path.match(/\/(\d+)$/);
    if (!match) return;
    const epNum = parseInt(match[1], 10);
    if (!seen.has(epNum)) {
      seen.add(epNum);
      eps.push({ num: epNum, url: BASE + path });
    }
  });

  eps.sort((a, b) => a.num - b.num);
  return eps;
}

async function getEpisodeDirectLinkAndLanguage(epUrl) {
  const res = await fetch(epUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: BASE,
    },
  });

  const data = await res.text();
  const $ = cheerio.load(data);
  const script = $("script")
    .filter((i, el) => $(el).html()?.includes("__sveltekit_"))
    .last()
    .html();

  if (!script) return { link: null, language: "Japonés" };

  const downloadsMatch = script.match(/downloads:\{SUB:\[(.*?)\](?:,DUB:\[(.*?)\])?\}/s);
  if (!downloadsMatch) return { link: null, language: "Japonés" };

  const subBlock = downloadsMatch[1] || "";
  const dubBlock = downloadsMatch[2] || "";

  function findPDrainLink(block) {
    const regex = /{server:"PDrain",url:"(https?:\/\/pixeldrain\.com\/u\/[^"]+)"}/g;
    const match = regex.exec(block);
    return match ? match[1] : null;
  }

  const dubLink = findPDrainLink(dubBlock);
  if (dubLink) return { link: dubLink, language: "Español" };

  const subLink = findPDrainLink(subBlock);
  if (subLink) return { link: subLink, language: "Japonés (Sub)" };

  return { link: null, language: "Japonés" };
}

async function getDirectVideo(pixUrl) {
  if (!pixUrl) return null;
  
  const fileIdMatch = pixUrl.match(/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/);
  if (!fileIdMatch) return null;
  
  const fileId = fileIdMatch[1];
  const directLink = `https://pixeldrain.com/api/file/${fileId}`;
  
  return directLink;
}

// --- HANDLER PRINCIPAL (Solo búsqueda y muestra de botones) ---

const handler = async (m, { conn, text, args }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('⚠️ Ingresa el nombre del anime que deseas buscar.');
  }

  // Si el usuario intenta usar el formato 'ep:NÚMERO', le pedimos que use los botones
  if (text.includes('ep:')) {
    const searchQuery = text.replace(/ep:\d+/g, '').trim();
    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });
    return m.reply(`Por favor, usa solo el nombre del anime para la búsqueda, y luego selecciona el episodio con los botones.\n\nEjemplo: *.anime ${searchQuery}*`);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

    const anime = await getAnime(text);
    
    if (!anime.status) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ No se encontró el anime.');
    }

    const searchId = Date.now().toString();
    global.animeSearches = global.animeSearches || {};
    
    // Almacenamos la información completa para usarla en handler.before
    global.animeSearches[searchId] = {
      ...anime,
      timestamp: Date.now()
    };

    // Limpieza de búsquedas antiguas
    Object.keys(global.animeSearches || {}).forEach(id => {
      // 10 minutos de expiración
      if (Date.now() - (global.animeSearches[id]?.timestamp || 0) > 10 * 60 * 1000) {
        delete global.animeSearches[id];
      }
    });

    const displayEpisodes = anime.episodesList.slice(0, 10);
    
    // Botones de Episodio: Usan un ID para ser procesados por handler.before
    const episodeButtons = displayEpisodes.map(ep => ({
      buttonId: `ep_${searchId}_${ep.num}`, 
      buttonText: { displayText: `📺 Ep ${ep.num}` },
      type: 1
    }));
    
    // Botones de acción
    const actionButtons = [
      { buttonId: `info_${searchId}`, buttonText: { displayText: 'ℹ️ Más Info' }, type: 1 },
      { buttonId: `list_${searchId}`, buttonText: { displayText: '📋 Lista Completa' }, type: 1 }
    ];

    const info = `
🎬 *${anime.title}*

📁 *Tipo:* ${anime.type}
📊 *Episodios Totales:* ${anime.episodios}
📝 *Descripción:* ${anime.description ? anime.description.slice(0, 100) + (anime.description.length > 100 ? '...' : '') : 'Sin descripción'}

🎯 *Selecciona un episodio para descargar:*
`.trim();

    // Lógica de envío con imagen y botones
    if (anime.image) {
      try {
        const thumbRes = await fetch(anime.image);
        if (thumbRes.ok) {
          const thumb = await thumbRes.arrayBuffer();
          await conn.sendMessage(m.chat, {
            image: Buffer.from(thumb),
            caption: info,
            footer: `Episodios 1-${Math.min(10, anime.episodios)} de ${anime.episodios} | Expira en 10 min`,
            buttons: [...episodeButtons, ...actionButtons],
            headerType: 4
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            text: info,
            footer: `Episodios 1-${Math.min(10, anime.episodios)} de ${anime.episodios} | Expira en 10 min`,
            buttons: [...episodeButtons, ...actionButtons],
          }, { quoted: m });
        }
      } catch {
        await conn.sendMessage(m.chat, {
          text: info,
          footer: `Episodios 1-${Math.min(10, anime.episodios)} de ${anime.episodios} | Expira en 10 min`,
          buttons: [...episodeButtons, ...actionButtons],
        }, { quoted: m });
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: info,
        footer: `Episodios 1-${Math.min(10, anime.episodios)} de ${anime.episodios} | Expira en 10 min`,
        buttons: [...episodeButtons, ...actionButtons],
      }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error('[anime-search] Error:', e);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 Error al buscar el anime. Intenta de nuevo.');
  }
};

// --- HANDLER BEFORE (Para manejar los clics en los botones) ---

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;
  
  try {
    // 1. Manejo de clics de EPISODIO
    if (id.startsWith('ep_')) {
      const parts = id.split('_');
      if (parts.length < 3) return;
      
      const searchId = parts[1];
      const epNum = parseInt(parts[2]);
      
      const animeData = global.animeSearches?.[searchId];
      if (!animeData) {
        return m.reply('⚠️ La búsqueda ha expirado. Busca el anime de nuevo.');
      }
      
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
      m.reply(`⏳ Obteniendo episodio ${epNum} de ${animeData.title}...`);
      
      const episode = animeData.episodesList.find(ep => ep.num === epNum);
      if (!episode) {
        return m.reply(`⚠️ No se encontró el episodio ${epNum}.`);
      }
      
      const { link: pixLink, language } = await getEpisodeDirectLinkAndLanguage(episode.url);
      
      if (!pixLink) {
        return m.reply('⚠️ No se pudo obtener el enlace de descarga (Pixeldrain no encontrado).');
      }

      const directLink = await getDirectVideo(pixLink);
      
      if (!directLink) {
        return m.reply('⚠️ No se pudo obtener el enlace de descarga final.');
      }

      try {
        await conn.sendMessage(
          m.chat,
          {
            video: { url: directLink },
            fileName: `${animeData.title} - Ep ${epNum}.mp4`,
            mimetype: 'video/mp4',
            caption: `🎬 *${animeData.title}*\n📺 Episodio ${epNum}\n🗣️ Idioma: ${language}\n\n_Powered by neveloopp_`
          },
          { quoted: m }
        );
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (videoError) {
        console.error('[anime-buttons] Error enviando video:', videoError);
        m.reply(`🎬 *${animeData.title}*\n📺 Episodio ${epNum}\n🗣️ Idioma: ${language}\n\n🔗 *¡Error al enviar el video!* Aquí está el link de descarga directo:\n${directLink}`);
        await conn.sendMessage(m.chat, { react: { text: '🔗', key: m.key } });
      }
    }
    
    // 2. Manejo de clics de INFORMACIÓN
    if (id.startsWith('info_')) {
      const searchId = id.replace('info_', '');
      const animeData = global.animeSearches?.[searchId];
      
      if (!animeData) {
        return m.reply('⚠️ La búsqueda ha expirado.');
      }
      
      const detailedInfo = `
🎬 INFORMACIÓN DETALLADA

📌 *Título:* ${animeData.title}
📁 *Tipo:* ${animeData.type}
📊 *Episodios Totales:* ${animeData.episodios}
📝 *Descripción Completa:*
${animeData.description || 'Sin descripción disponible'}

🌐 *URL:* ${animeData.url}
🖼️ *Imagen:* ${animeData.image || 'No disponible'}
`.trim();
      
      await conn.sendMessage(m.chat, { text: detailedInfo }, { quoted: m });
    }
    
    // 3. Manejo de clics de LISTA COMPLETA
    if (id.startsWith('list_')) {
      const searchId = id.replace('list_', '');
      const animeData = global.animeSearches?.[searchId];
      
      if (!animeData) {
        return m.reply('⚠️ La búsqueda ha expirado.');
      }
      
      const allEpisodes = animeData.episodesList.map(ep => ep.num);
      
      let episodeList = `📋 *LISTA COMPLETA DE EPISODIOS*\n\n`;
      episodeList += `🎬 *${animeData.title}*\n`;
      episodeList += `📊 Total: ${allEpisodes.length} episodios\n\n`;
      
      // Formatear la lista
      for (let i = 0; i < allEpisodes.length; i += 10) {
        const chunk = allEpisodes.slice(i, i + 10);
        episodeList += `📁 Episodios ${i + 1}-${i + chunk.length}: ${chunk.join(', ')}\n`;
      }
      
      episodeList += `\n💡 Por favor, usa los botones del menú de búsqueda para seleccionar y descargar.`;
      
      await conn.sendMessage(m.chat, { text: episodeList }, { quoted: m });
    }
    
  } catch (e) {
    console.error('[anime-buttons] Error:', e);
    m.reply('💥 Error al procesar tu selección.');
  }
};

handler.command = ['anime2', 'animedl'];
handler.tags = ['anime', 'descargas'];
handler.help = ['anime <nombre> - Buscar anime y seleccionar episodio con botones'];

export default handler;
