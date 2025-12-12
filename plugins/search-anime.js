import fetch from 'node-fetch';
import cheerio from 'cheerio';

const BASE = "https://animeav1.com";

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
      episodes: episodes.slice(0, 10),
      totalEpisodes: episodes.length,
      timestamp: Date.now()
    };
    
    Object.keys(global.animeSearches || {}).forEach(id => {
      if (Date.now() - (global.animeSearches[id]?.timestamp || 0) > 10 * 60 * 1000) {
        delete global.animeSearches[id];
      }
    });

    const episodeButtons = episodes.slice(0, 10).map(ep => ({
      buttonId: `ep_${searchId}_${ep.num}`,
      buttonText: { displayText: `📺 Ep ${ep.num}` },
      type: 1
    }));

    const actionButtons = [
      { buttonId: `info_${searchId}`, buttonText: { displayText: 'ℹ️ Más Info' }, type: 1 },
      { buttonId: `list_${searchId}`, buttonText: { displayText: '📋 Lista Completa' }, type: 1 }
    ];

    const info = `
🎬 *${animeTitle}*

📁 *Tipo:* ${animeType}
📊 *Episodios:* ${episodes.length}
📝 *Descripción:* ${animeDescription.slice(0, 100)}${animeDescription.length > 100 ? '...' : ''}

🎯 *Selecciona un episodio:*
`.trim();

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
          await conn.sendMessage(m.chat, {
            text: info,
            footer: `Resultados 1-${Math.min(10, episodes.length)} de ${episodes.length}`,
            buttons: [...episodeButtons, ...actionButtons],
          }, { quoted: m });
        }
      } catch {
        await conn.sendMessage(m.chat, {
          text: info,
          footer: `Resultados 1-${Math.min(10, episodes.length)} de ${episodes.length}`,
          buttons: [...episodeButtons, ...actionButtons],
        }, { quoted: m });
      }
    } else {
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
    m.reply('💥 *Error al buscar el anime. Intenta de nuevo.*');
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
      
      const episode = animeData.episodes.find(ep => ep.num === epNum);
      if (!episode) {
        return m.reply(`⚠️ No se encontró el episodio ${epNum}.`);
      }
      
      const directLink = await getDirectVideoLink(episode.url);
      
      if (!directLink) {
        return m.reply('⚠️ No se pudo obtener el enlace de descarga.');
      }
      
      const language = 'Español';
      
      await conn.sendMessage(
        m.chat,
        {
          video: { url: directLink },
          fileName: `${animeData.title} - Episodio ${epNum} (${language}).mp4`,
          mimetype: 'video/mp4',
          caption: `🎬 *${animeData.title}*\n📺 Episodio ${epNum}\n🗣️ Idioma: ${language}`
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
🎬 *INFORMACIÓN DETALLADA*

📌 *Título:* ${animeData.title}
📁 *Tipo:* ${animeData.type}
📊 *Episodios Totales:* ${animeData.totalEpisodes}
📝 *Descripción Completa:*
${animeData.description || 'Sin descripción disponible'}

🌐 *URL:* ${animeData.animeUrl}
🖼️ *Imagen:* ${animeData.image || 'No disponible'}

💡 *Para descargar un episodio, selecciona uno de los botones numéricos.*
`.trim();
      
      await conn.sendMessage(m.chat, { text: detailedInfo }, { quoted: m });
    }
    
    if (id.startsWith('list_')) {
      const searchId = id.replace('list_', '');
      const animeData = global.animeSearches?.[searchId];
      
      if (!animeData) {
        return m.reply('⚠️ La búsqueda ha expirado.');
      }
      
      const allEpisodesRes = await fetch(animeData.animeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: BASE,
        }
      });
      
      const allEpisodesHtml = await allEpisodesRes.text();
      const $$$ = cheerio.load(allEpisodesHtml);
      
      const allEpisodes = [];
      const allSeen = new Set();
      
      $$$("a.absolute.inset-0").each((i, el) => {
        const path = $$$(el).attr("href");
        if (!path) return;
        const match = path.match(/\/(\d+)$/);
        if (!match) return;
        const epNum = parseInt(match[1], 10);
        if (!allSeen.has(epNum)) {
          allSeen.add(epNum);
          allEpisodes.push(epNum);
        }
      });
      
      allEpisodes.sort((a, b) => a - b);
      
      let episodeList = `📋 *LISTA COMPLETA DE EPISODIOS*\n\n`;
      episodeList += `🎬 *${animeData.title}*\n`;
      episodeList += `📊 Total: ${allEpisodes.length} episodios\n\n`;
      
      for (let i = 0; i < allEpisodes.length; i += 10) {
        const chunk = allEpisodes.slice(i, i + 10);
        episodeList += `📁 Episodios ${i + 1}-${i + chunk.length}: ${chunk.join(', ')}\n`;
      }
      
      episodeList += `\n💡 Usa el comando nuevamente para descargar episodios específicos.`;
      
      await conn.sendMessage(m.chat, { text: episodeList }, { quoted: m });
    }
    
  } catch (e) {
    console.error('[anime-buttons] Error:', e);
    m.reply('💥 *Error al procesar tu selección.*');
  }
};

async function getDirectVideoLink(epUrl) {
  try {
    const epRes = await fetch(epUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: BASE,
      }
    });
    
    const epHtml = await epRes.text();
    const $ = cheerio.load(epHtml);
    
    const script = $("script")
      .filter((i, el) => $(el).html().includes("__sveltekit_"))
      .last()
      .html();
    
    if (!script) return null;
    
    const downloadsMatch = script.match(/downloads:\{SUB:\[(.*?)\](?:,DUB:\[(.*?)\])?\}/s);
    if (!downloadsMatch) return null;
    
    const subBlock = downloadsMatch[1] || "";
    const dubBlock = downloadsMatch[2] || "";
    
    function findPDrainLink(block) {
      const regex = /{server:"PDrain",url:"(https?:\/\/pixeldrain\.com\/u\/[^"]+)"}/g;
      const match = regex.exec(block);
      return match ? match[1] : null;
    }
    
    let pixUrl = findPDrainLink(dubBlock) || findPDrainLink(subBlock);
    
    if (!pixUrl) return null;
    
    const fileIdMatch = pixUrl.match(/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/);
    if (!fileIdMatch) return pixUrl;
    
    const fileId = fileIdMatch[1];
    
    const bypassUrl = `https://cdn-pixeldrain-nv.vercel.app/api/cdn/pixeldrain?url=https://pixeldrain.com/api/file/${fileId}&download=true`;
    
    return bypassUrl;
    
  } catch (error) {
    console.error('[getDirectVideoLink] Error:', error);
    return null;
  }
}

handler.command = ['anime'];
handler.tags = ['anime', 'descargas'];
handler.help = ['anime <nombre> - Buscar y descargar anime'];

export default handler;