import fetch from 'node-fetch';
import cheerio from 'cheerio';

const BASE = "https://animeav1.com";

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
  if (subLink) return { link: subLink, language: "Japonés" };

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

const handler = async (m, { conn, text, args }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
    return m.reply('⚠️ Ingresa el nombre del anime que deseas buscar.\n\nEjemplo: .anime naruto');
  }

  const epArg = args.find(a => a.startsWith('ep:'));
  const requestedEp = epArg ? parseInt(epArg.replace('ep:', '')) : null;
  const searchQuery = text.replace(/ep:\d+/g, '').trim();

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

    const anime = await getAnime(searchQuery);
    
    if (!anime.status) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply('❌ No se encontró el anime.');
    }

    if (requestedEp) {
      const episode = anime.episodesList.find(ep => ep.num === requestedEp);
      if (!episode) {
        return m.reply(`⚠️ El episodio ${requestedEp} no existe. Este anime tiene ${anime.episodios} episodios.`);
      }

      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
      m.reply(`⏳ Obteniendo episodio ${requestedEp} de ${anime.title}...`);

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
            fileName: `${anime.title} - Ep ${requestedEp}.mp4`,
            mimetype: 'video/mp4',
            caption: `🎬 *${anime.title}*\n📺 Episodio ${requestedEp}\n🗣️ Idioma: ${language}\n\n_Powered by neveloopp_`
          },
          { quoted: m }
        );
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (videoError) {
        console.error('[anime-search] Error enviando video:', videoError);
        m.reply(`🎬 *${anime.title}*\n📺 Episodio ${requestedEp}\n🗣️ Idioma: ${language}\n\n🔗 Link de descarga:\n${directLink}`);
        await conn.sendMessage(m.chat, { react: { text: '🔗', key: m.key } });
      }
      return;
    }

    const searchId = Date.now().toString();
    global.animeSearches = global.animeSearches || {};
    global.animeSearches[searchId] = {
      ...anime,
      timestamp: Date.now()
    };

    Object.keys(global.animeSearches || {}).forEach(id => {
      if (Date.now() - (global.animeSearches[id]?.timestamp || 0) > 10 * 60 * 1000) {
        delete global.animeSearches[id];
      }
    });

    const displayEpisodes = anime.episodesList.slice(0, 15);
    const episodeList = displayEpisodes.map(ep => `• Ep ${ep.num}`).join('\n');

    const info = `
🎬 *${anime.title}*

📁 *Tipo:* ${anime.type}
📊 *Episodios:* ${anime.episodios}
📝 *Descripción:* ${anime.description ? anime.description.slice(0, 150) + (anime.description.length > 150 ? '...' : '') : 'Sin descripción'}

🎯 *Episodios disponibles:*
${episodeList}
${anime.episodios > 15 ? `\n... y ${anime.episodios - 15} más` : ''}

💡 *Para descargar un episodio usa:*
.anime ${searchQuery} ep:NÚMERO

_Ejemplo: .anime ${searchQuery} ep:1_

🔗 ${anime.url}
`.trim();

    if (anime.image) {
      try {
        const thumbRes = await fetch(anime.image);
        if (thumbRes.ok) {
          const thumb = await thumbRes.arrayBuffer();
          await conn.sendMessage(m.chat, {
            image: Buffer.from(thumb),
            caption: info
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, { text: info }, { quoted: m });
        }
      } catch {
        await conn.sendMessage(m.chat, { text: info }, { quoted: m });
      }
    } else {
      await conn.sendMessage(m.chat, { text: info }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error('[anime-search] Error:', e);
    await conn.sendMessage(m.chat, { react: { text: '💥', key: m.key } });
    m.reply('💥 Error al buscar el anime. Intenta de nuevo.');
  }
};

handler.command = ['anime2', 'animedl'];
handler.tags = ['anime', 'descargas'];
handler.help = ['anime <nombre> - Buscar anime', 'anime <nombre> ep:NÚMERO - Descargar episodio específico'];

export default handler;
