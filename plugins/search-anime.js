import fetch from 'node-fetch';
import cheerio from 'cheerio';

const BASE = "https://animeav1.com";

// Función mejorada para obtener el enlace de Pixeldrain y el idioma
async function getPixeldrainLinkAndLanguage(epUrl) {
  try {
    const epRes = await fetch(epUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: BASE,
      }
    });

    if (!epRes.ok) throw new Error('Error al obtener la página del episodio');

    const epHtml = await epRes.text();
    const $ = cheerio.load(epHtml);

    // Buscamos el script que contiene la variable de descargas
    const script = $("script")
      .filter((i, el) => $(el).html()?.includes("sveltekit_") && $(el).html()?.includes("downloads:"))
      .last()
      .html();

    if (!script) return { link: null, language: "Japonés" };

    // Regex para extraer todo el bloque 'downloads' (SUB y DUB)
    const downloadsMatch = script.match(/downloads:(\{SUB:\[.*?\](?:,DUB:\[.*?\])?\})/s);

    if (!downloadsMatch) return { link: null, language: "Japonés" };

    const downloadsBlock = downloadsMatch[1];

    // Función auxiliar para encontrar el enlace de Pixeldrain (PDrain) dentro de un bloque
    function findPDrainLink(block) {
      const regex = /{server:"PDrain",url:"(https?:\/\/pixeldrain\.com\/u\/[^"]+)"}/;
      const match = regex.exec(block);
      return match ? match[1] : null;
    }

    // 1. Prioridad al Español (DUB)
    const dubBlockMatch = downloadsBlock.match(/DUB:\[(.*?)\]/s);
    if (dubBlockMatch) {
      const dubLink = findPDrainLink(dubBlockMatch[1]);
      if (dubLink) return { link: dubLink, language: "Español" };
    }

    // 2. Si no hay DUB o PDrain en DUB, busca SUB
    const subBlockMatch = downloadsBlock.match(/SUB:\[(.*?)\]/s);
    if (subBlockMatch) {
      const subLink = findPDrainLink(subBlockMatch[1]);
      if (subLink) return { link: subLink, language: "Japonés (Sub)" };
    }

    return { link: null, language: "Desconocido" };

  } catch (error) {
    console.error('[getPixeldrainLinkAndLanguage] Error:', error);
    return { link: null, language: "Error" };
  }
}

// Función para usar el bypass y obtener el URL final del video
async function getFinalVideoUrl(pixUrl) {
  if (!pixUrl) return null;

  const fileIdMatch = pixUrl.match(/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/);
  if (!fileIdMatch) return pixUrl; 

  const fileId = fileIdMatch[1];

  // Usando el bypass de Vercel (la URL que proporcionaste)
  const bypassUrl = `https://cdn-pixeldrain-nv.vercel.app/api/cdn/pixeldrain?url=https://pixeldrain.com/api/file/${fileId}&download=true`;

  return bypassUrl;
}

const handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('⚠️ Ingresa el nombre del anime que deseas buscar.');
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

    const searchUrl = `${BASE}/catalogo?search=${encodeURIComponent(text)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: BASE,
      }
    });
    
    if (!searchRes.ok) throw new Error('Error en la búsqueda');
    
    const html = await searchRes.text();
    const $ = cheerio.load(html);
    const firstResult = $("article").first();
    
    if (!firstResult.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ No se encontraron resultados.');
    }

    const animePath = firstResult.find("a.absolute.inset-0").attr("href");
    if (!animePath) throw new Error('URL del anime no encontrada');
    
    const animeUrl = BASE + animePath;
    const animeTitle = firstResult.find("h3").text().trim();
    const animeType = firstResult.find(".text-xs.font-bold.text-subs").text().trim();
    const animeImage = firstResult.find("img").attr("src");
    const animeDescription = firstResult.find("p").text().trim() || "Sin descripción disponible";
    
    const animePageRes = await fetch(animeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: BASE,
      }
    });
    
    const animeHtml = await animePageRes.text();
    const $$ = cheerio.load(animeHtml);
    
    const episodes = [];
    const seen = new Set();
    
    $$("a.absolute.inset-0").each((i, el) => {
      const path = $$(el).attr("href");
      if (!path) return;
      const match = path.match(/\/(\d+)$/);
      if (!match) return;
      const epNum = parseInt(match[1], 10);
      if (!seen.has(epNum)) {
        seen.add(epNum);
        episodes.push({ 
          num: epNum, 
          url: BASE + path,
          name: `Episodio ${epNum}`
        });
      }
    });
    
    episodes.sort((a, b) => a.num - b.num);
    
    if (episodes.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ No se encontraron episodios para este anime.');
    }
    
    const searchId = Date.now().toString();
    global.animeSearches = global.animeSearches || {};
    global.animeSearches[searchId] = {
      animeUrl,
      title: animeTitle,
      type: animeType,
      image: animeImage,
      description: animeDescription,
      episodes: episodes, // Guardamos todos para la lista completa
      totalEpisodes: episodes.length,
      timestamp: Date.now()
    };
    
    // Limpieza de búsquedas antiguas
    Object.keys(global.animeSearches || {}).forEach(id => {
      // 10 minutos de expiración
      if (Date.now() - (global.animeSearches[id]?.timestamp || 0) > 10 * 60 * 1000) {
        delete global.animeSearches[id];
      }
    });

    // Muestra solo los primeros 10 episodios
    const displayEpisodes = episodes.slice(0, 10);

    const episodeButtons = displayEpisodes.map(ep => ({
      buttonId: `ep_${searchId}_${ep.num}`,
      buttonText: { displayText: `📺 Ep ${ep.num}` },
      type: 1
    }));

    const actionButtons = [
      { buttonId: `info_${searchId}`, buttonText: { displayText: 'ℹ️ Más Info' }, type: 1 },
      { buttonId: `list_${searchId}`, buttonText: { displayText: '📋 Lista Completa' }, type: 1 }
    ];

    const info = `
🎬 ${animeTitle}

📁 Tipo: ${animeType}
📊 Episodios: ${episodes.length}
📝 Descripción: ${animeDescription.slice(0, 100)}${animeDescription.length > 100 ? '...' : ''}

🎯 Selecciona un episodio:
`.trim();

    // Lógica para enviar el mensaje con imagen y botones
    if (animeImage) {
      try {
        const thumbRes = await fetch(animeImage);
        if (thumbRes.ok) {
          const thumb = await thumbRes.arrayBuffer();
          await conn.sendMessage(m.chat, {
            image: Buffer.from(thumb),
            caption: info,
            footer: `Resultados 1-${Math.min(10, episodes.length)} de ${episodes.length}`,
            buttons: [...episodeButtons, ...actionButtons],
            headerType: 4
          }, { quoted: m });
        } else {
          // Fallback sin imagen
          await conn.sendMessage(m.chat, {
            text: info,
            footer: `Resultados 1-${Math.min(10, episodes.length)} de ${episodes.length}`,
            buttons: [...episodeButtons, ...actionButtons],
          }, { quoted: m });
        }
      } catch {
        // Fallback en caso de error de descarga de imagen
        await conn.sendMessage(m.chat, {
          text: info,
          footer: `Resultados 1-${Math.min(10, episodes.length)} de ${episodes.length}`,
          buttons: [...episodeButtons, ...actionButtons],
        }, { quoted: m });
      }
    } else {
      // Fallback si no hay URL de imagen
      await conn.sendMessage(m.chat, {
        text: info,
        footer: `Resultados 1-${Math.min(10, episodes.length)} de ${episodes.length}`,
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

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  try {
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
      
      // Busca el episodio en la lista completa
      const episode = animeData.episodes.find(ep => ep.num === epNum);
      if (!episode) {
        return m.reply(`⚠️ No se encontró el episodio ${epNum}.`);
      }
      
      // -- USO DE LAS NUEVAS FUNCIONES DE EXTRACCIÓN Y BYPASS --
      const { link: pixLink, language } = await getPixeldrainLinkAndLanguage(episode.url);
      
      if (!pixLink) {
        return m.reply('⚠️ No se pudo obtener el enlace de descarga (Pixeldrain no encontrado).');
      }
      
      const directLink = await getFinalVideoUrl(pixLink);
      
      if (!directLink) {
        return m.reply('⚠️ No se pudo obtener el enlace de descarga final.');
      }
      // -- FIN DE USO DE LAS NUEVAS FUNCIONES --
      
      await conn.sendMessage(
        m.chat,
        {
          video: { url: directLink },
          fileName: `${animeData.title} - Episodio ${epNum} (${language}).mp4`,
          mimetype: 'video/mp4',
          caption: `🎬 ${animeData.title}\n📺 Episodio ${epNum}\n🗣️ Idioma: ${language}`
        },
        { quoted: m }
      );
      
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
    
    if (id.startsWith('info_')) {
      const searchId = id.replace('info_', '');
      const animeData = global.animeSearches?.[searchId];
      
      if (!animeData) {
        return m.reply('⚠️ La búsqueda ha expirado.');
      }
      
      const detailedInfo = `
🎬 INFORMACIÓN DETALLADA

📌 Título: ${animeData.title}
📁 Tipo: ${animeData.type}
📊 Episodios Totales: ${animeData.totalEpisodes}
📝 Descripción Completa:
${animeData.description || 'Sin descripción disponible'}

🌐 URL: ${animeData.animeUrl}
🖼️ Imagen: ${animeData.image || 'No disponible'}

💡 Para descargar un episodio, selecciona uno de los botones numéricos.
`.trim();
      
      await conn.sendMessage(m.chat, { text: detailedInfo }, { quoted: m });
    }
    
    if (id.startsWith('list_')) {
      const searchId = id.replace('list_', '');
      const animeData = global.animeSearches?.[searchId];
      
      if (!animeData) {
        return m.reply('⚠️ La búsqueda ha expirado.');
      }
      
      // Reutilizamos la lista de episodios que ya cargamos en el handler principal
      const allEpisodes = animeData.episodes.map(ep => ep.num);
      
      let episodeList = `📋 LISTA COMPLETA DE EPISODIOS\n\n`;
      episodeList += `🎬 ${animeData.title}\n`;
      episodeList += `📊 Total: ${allEpisodes.length} episodios\n\n`;
      
      // Formatear la lista para que no sea un bloque enorme
      for (let i = 0; i < allEpisodes.length; i += 10) {
        const chunk = allEpisodes.slice(i, i + 10);
        episodeList += `📁 Episodios ${i + 1}-${i + chunk.length}: ${chunk.join(', ')}\n`;
      }
      
      episodeList += `\n💡 Usa el comando nuevamente para descargar episodios específicos.`;
      
      await conn.sendMessage(m.chat, { text: episodeList }, { quoted: m });
    }
    
  } catch (e) {
    console.error('[anime-buttons] Error:', e);
    m.reply('💥 Error al procesar tu selección.');
  }
};

handler.command = ['anime'];
handler.tags = ['anime', 'descargas'];
handler.help = ['anime <nombre> - Buscar y descargar anime'];

export default handler;
