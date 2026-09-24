import axios from 'axios'
import * as cheerio from 'cheerio'

const UA      = 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const BASE    = 'https://apkpure.net';
const DL_BASE = 'https://d.apkpure.net';
const HEADERS = { 'User-Agent': UA, 'Referer': BASE };

function extractPkg(href) {
  const m = href?.match(/\/((?:com|org|net|io|co)\.[a-zA-Z0-9_.]+)(?:\/|$)/i)
  return m ? m[1] : ''
}

function extractPkgFromEl($, el) {
  const fromAttr = $(el).find('[data-dt-pkg]').attr('data-dt-pkg')
  if (fromAttr) return fromAttr
  const href = $(el).find('a.top').first().attr('href') || ''
  return extractPkg(href)
}

function parsePageData(data) {
  try {
    const m = data.match(/window\.apkpure\s=\s\{pageData:\s(\{.?\})\s*[,;]/s);
    if (m) return JSON.parse(m[1]);
  } catch {}
  return null;
}

async function apks(query, limit = 5) {
  const { data } = await axios.get(`${BASE}/search?q=${encodeURIComponent(query)}`, {
    headers: HEADERS, timeout: 15000
  });
  const $       = cheerio.load(data);
  const results = [];
  const seen    = new Set();

  $('.search-brand-container').each((_, el) => {
    if (results.length >= limit) return false;
    const name    = $(el).find('a.top').first().text().trim();
    const dev     = $(el).find('a.developer').first().text().trim();
    const date    = $(el).find('span.time').first().text().trim();
    const icon    = $(el).find('img.app-icon-img').first().attr('data-original') || '';
    const appHref = $(el).find('a.top').first().attr('href') || '';
    const pkg     = extractPkgFromEl($, el)
    if (!name || !pkg || seen.has(pkg)) return;
    seen.add(pkg);
    const appUrl = appHref.startsWith('http') ? appHref : `${BASE}${appHref}`;
    results.push({ name, developer: dev, pkg, date, icon, appUrl });
  });

  return results;
}

async function apkdl(pkgOrUrl) {
  let pkg = (typeof pkgOrUrl === 'string' && pkgOrUrl.includes('apkpure'))
    ? extractPkg(pkgOrUrl)
    : pkgOrUrl
  const shortName = pkg.split('.').slice(-2).join('-').toLowerCase();
  const { data } = await axios.get(`${BASE}/${shortName}/${pkg}/download`, {
    headers: HEADERS, timeout: 15000, validateStatus: () => true
  });
  const $       = cheerio.load(data);
  const pageData = parsePageData(data);
  const name    = pageData?.versionName
    ? $('title').text().split(' APK')[0].replace('Download ', '').trim()
    : $('h1, .title-like').first().text().trim();
  const version = pageData?.versionName || $('[class*="version"]').first().text().trim().match(/[\d.]+/)?.[0] || '';
  const size    = $('[class*="size"]').first().text().trim();
  const icon    = $('img.app-icon-img, img.app-icon').first().attr('data-original') || $('img[src*="winudf"]').first().attr('src') || '';
  const dev     = $('[class*="developer"], .dev-info, [itemprop="author"]').first().text().trim();
  return { name, developer: dev, pkg, version, size, icon, download: `${DL_BASE}/b/APK/${pkg}?version=latest` };
}

const handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, '《✧》 Ingresa el nombre de la aplicación.', m)
  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    const query = args.join(' ')
    const results = await apks(query, 1)
    const app = results[0]
    if (!app) return conn.reply(m.chat, '❏ No se encontró la aplicación.', m)
    const detail = await apkdl(app.pkg)
    await conn.sendMessage(m.chat, {
      image: { url: detail.icon },
      caption: `✿ *${detail.name}*\n📦 Paquete: ${detail.pkg}\n📝 Versión: ${detail.version}\n📂 Tamaño: ${detail.size}\n👤 Desarrollador: ${detail.developer}`
    }, { quoted: m })
    await conn.sendFile(m.chat, detail.download, `${detail.pkg}.apk`, '', m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.reply(m.chat, `❏ Error al descargar.\n❏ Detalles: ${e.message}`, m)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
  }
}

handler.command = ['apk']
handler.tags = ['descargas']
handler.help = ['apk']
handler.group = true

export default handler