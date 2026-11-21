import moment from 'moment-timezone'
import { getBotConfig } from '../lib/botconfig.js'
import { createCanvas, loadImage } from '@napi-rs/canvas'

const CATEGORY_META = {
  main: '⊹ الرئيسية ⊹',
  rg: '⊹ التسجيل ⊹',
  info: '⊹ معلومات ⊹',
  ia: '⊹ ذكاء اصطناعي ⊹',
  nable: '⊹ وظائف ⊹',
  buscadores: '⊹ البحث ⊹',
  descargas: '⊹ التحميل ⊹',
  imagen: '⊹ صور ⊹',
  fun: '⊹ ترفيه ⊹',
  game: '⊹ ألعاب ⊹',
  anime: '⊹ أنمي ⊹',
  grupo: '⊹ المشرفين ⊹',
  gacha: '⊹ جاتشا ⊹',
  text: '⊹ تأثيرات ⊹',
  rpg: '⊹ الاقتصاد ⊹',
  economy: '⊹ الاقتصاد ⊹',
  perfil: '⊹ الملف الشخصي ⊹',
  sticker: '⊹ ستيكرز ⊹',
  tools: '⊹ أدوات ⊹',
  owner: '⊹ المطور ⊹',
  serbot: '⊹ بوتات فرعية ⊹'
}

const CATEGORY_EMOJI = {
  '⊹ الرئيسية ⊹': '🏠',
  '⊹ التسجيل ⊹': '📝',
  '⊹ معلومات ⊹': 'ℹ️',
  '⊹ ذكاء اصطناعي ⊹': '🤖',
  '⊹ وظائف ⊹': '💼',
  '⊹ البحث ⊹': '🔎',
  '⊹ التحميل ⊹': '📥',
  '⊹ صور ⊹': '🖼️',
  '⊹ ترفيه ⊹': '🎉',
  '⊹ ألعاب ⊹': '🎮',
  '⊹ أنمي ⊹': '🌸',
  '⊹ المشرفين ⊹': '🛡️',
  '⊹ جاتشا ⊹': '🎴',
  '⊹ تأثيرات ⊹': '✨',
  '⊹ الاقتصاد ⊹': '💰',
  '⊹ الملف الشخصي ⊹': '👤',
  '⊹ ستيكرز ⊹': '🏷️',
  '⊹ أدوات ⊹': '🧰',
  '⊹ المطور ⊹': '👑',
  '⊹ بوتات فرعية ⊹': '🧩'
}

const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb7h1qC65yDEhghegc2O'
const DEFAULT_AVATAR = 'https://project-sxl.vercel.app/files/0b1ac71e42ed.jpg'

let cachedBannerBuffer = null
let cachedBannerUrl = null

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`خطأ في تحميل الصورة: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function getBannerBuffer(url) {
  if (cachedBannerBuffer && cachedBannerUrl === url) return cachedBannerBuffer
  try {
    const buf = await fetchBuffer(url)
    cachedBannerBuffer = buf
    cachedBannerUrl = url
    return buf
  } catch {
    return null
  }
}

async function generateUserOverlay(avatarBuffer, width, height) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const avatarSize = 95
  const padding = 20
  const avatarX = width - avatarSize - padding
  const avatarY = height - avatarSize - padding
  const centerX = avatarX + avatarSize / 2
  const centerY = avatarY + avatarSize / 2

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 8
  ctx.beginPath()
  ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.01)'
  ctx.fill()
  ctx.restore()

  const gradient = ctx.createRadialGradient(centerX, centerY, avatarSize / 2 - 5, centerX, centerY, avatarSize / 2 + 15)
  gradient.addColorStop(0, 'rgba(37, 211, 102, 0.8)')
  gradient.addColorStop(1, 'rgba(37, 211, 102, 0)')

  ctx.beginPath()
  ctx.arc(centerX, centerY, avatarSize / 2 + 15, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  try {
    const avatarImg = await loadImage(avatarBuffer)
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize)
    ctx.restore()
  } catch {
    ctx.beginPath()
    ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = '#25D366'
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 40px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('?', centerX, centerY)
  }

  ctx.beginPath()
  ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#25D366'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(centerX, centerY, avatarSize / 2 + 2, 0, Math.PI * 2)
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.stroke()

  return canvas.encode('png')
}

const NUM_EMOJI = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

export function collectCategories() {
  const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
  const byTag = {}
  for (const plugin of pluginsActivos) {
    const tags = plugin.owner ? ['owner'] : (Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : []))
    const helps = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : [])
    for (const tag of tags) {
      if (!CATEGORY_META[tag]) continue
      if (!byTag[tag]) byTag[tag] = new Set()
      for (const h of helps) if (typeof h === 'string' && h.trim()) byTag[tag].add(h.trim())
    }
  }
  const merged = new Map()
  for (const tag of Object.keys(CATEGORY_META)) {
    const set = byTag[tag]
    if (!set || set.size === 0) continue
    const label = CATEGORY_META[tag]
    const entry = merged.get(label) || { label, cmds: new Set() }
    for (const c of set) entry.cmds.add(c)
    merged.set(label, entry)
  }
  return [...merged.values()].map((e, i) => ({ n: i + 1, label: e.label, cmds: [...e.cmds].sort(), emoji: CATEGORY_EMOJI[e.label] || '▸' }))
}

const cleanLabel = label => label.replace(/⊹/g, '').trim()
const numEmoji = n => NUM_EMOJI[n - 1] || `${n}.`

export function buildIndexText({ categories, userName, botname, botType, channelUrl }) {
  const l = []
  l.push(`أهلاً *${userName}* أنا *${botname}* (${botType})`)
  l.push(`عندي *${categories.length}* أقسام — اختار القسم اللي تحبه 👇`)
  l.push('')
  for (const c of categories) {
    l.push(`${numEmoji(c.n)} *ق${c.n}*  ${c.emoji} ${cleanLabel(c.label)}  (${c.cmds.length})`)
  }
  l.push('')
  l.push('✎ اكتب *.ق1* أو *.اوامر 1* عشان تشوف أوامر القسم')
  l.push(`│${channelUrl}`)
  return l.join('\n')
}

export function buildCategoryText({ categories, index, userName, botname, channelUrl }) {
  const c = categories[index - 1]
  const l = []
  l.push(`${c.emoji} *${c.label}*  ⟪ ${index}/${categories.length} ⟫`)
  l.push(`أهلاً *${userName}* — دي أوامر قسم ${cleanLabel(c.label)}`)
  l.push('')
  l.push(c.cmds.map(x => `├❍ .${x}`).join('\n'))
  l.push('')
  const nav = ['*.اوامر* رجوع']
  if (index > 1) nav.push(`*.ق${index - 1}* السابق`)
  if (index < categories.length) nav.push(`*.ق${index + 1}* التالي`)
  l.push(nav.join('   |   '))
  return l.join('\n')
}

let handler = async (m, { conn, command, args }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '📋', key: m.key } })

    const categories = collectCategories()
    if (!categories.length) {
      return conn.sendMessage(m.chat, { text: '✿ مفيش أقسام متاحة' }, { quoted: m })
    }

    const userName = m.pushName || 'مستخدم'
    const botnameConfig = getBotConfig(conn, 'botname') || 'Bot'

    const mainBotJid = global.conn?.user?.jid?.split(':')[0]
    const currentBotJid = conn.user?.jid?.split(':')[0]
    const isMainBot = mainBotJid && currentBotJid && mainBotJid === currentBotJid
    const botType = isMainBot ? ' البوت الرئيسي' : ' بوت فرعي'

    const qMatch = String(command || '').trim().match(/^ق\s*(\d{1,2})$/)
    const numArg = (args || []).map(a => String(a).trim()).find(a => /^\d{1,2}$/.test(a))
    let index = qMatch ? Number(qMatch[1]) : (numArg ? Number(numArg) : 0)
    if (index < 1 || index > categories.length) index = 0

    const menuTexto = index
      ? buildCategoryText({ categories, index, userName, botname: botnameConfig, channelUrl: CHANNEL_URL })
      : buildIndexText({ categories, userName, botname: botnameConfig, botType, channelUrl: CHANNEL_URL })

    const BANNER_URL = getBotConfig(conn, 'banner2')
    const bannerBuffer = await getBannerBuffer(BANNER_URL)

    if (!bannerBuffer) {
      return await conn.sendMessage(m.chat, { text: menuTexto.trim() }, { quoted: m })
    }

    let avatarBuffer = null
    try {
      const ppUrl = await conn.profilePictureUrl(m.sender, 'image').catch(() => null)
      if (ppUrl) avatarBuffer = await fetchBuffer(ppUrl)
    } catch {}
    if (!avatarBuffer) {
      try { avatarBuffer = await fetchBuffer(DEFAULT_AVATAR) } catch { avatarBuffer = null }
    }

    let finalBuffer = bannerBuffer
    try {
      const bannerImg = await loadImage(bannerBuffer)
      const canvas = createCanvas(bannerImg.width, bannerImg.height)
      const ctx = canvas.getContext('2d')
      
      ctx.drawImage(bannerImg, 0, 0, bannerImg.width, bannerImg.height)

      const gradientOverlay = ctx.createLinearGradient(0, bannerImg.height * 0.6, 0, bannerImg.height)
      gradientOverlay.addColorStop(0, 'rgba(0, 0, 0, 0)')
      gradientOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.6)')
      ctx.fillStyle = gradientOverlay
      ctx.fillRect(0, 0, bannerImg.width, bannerImg.height)

      if (avatarBuffer) {
        const overlayBuffer = await generateUserOverlay(avatarBuffer, bannerImg.width, bannerImg.height)
        const overlayImg = await loadImage(overlayBuffer)
        ctx.drawImage(overlayImg, 0, 0, bannerImg.width, bannerImg.height)
      }

      finalBuffer = await canvas.encode('png')
    } catch (e) {
      console.error('خطأ في الرسم:', e)
    }

    return await conn.sendMessage(
      m.chat,
      {
        image: finalBuffer,
        caption: menuTexto.trim(),
        mimetype: 'image/png',
        footer: botnameConfig
      },
      { quoted: m }
    )

  } catch (e) {
    await conn.sendMessage(m.chat, { text: `✿ خطأ: ${e.message || e}` }, { quoted: m })
  }
}

handler.help = ['اوامر']
handler.tags = ['info']
handler.command = ['menu', 'help', 'اوامر', 'قائمة', 'مساعدة', /^ق\d{1,2}$/]

export default handler