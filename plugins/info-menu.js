import moment from 'moment-timezone'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'
import { getBotConfig } from '../lib/botconfig.js'
import { createCanvas, loadImage } from '@napi-rs/canvas'

const CATEGORY_META = {
  main: '⊹ Main ⊹',
  rg: '⊹ Registro ⊹',
  info: '⊹ Información ⊹',
  ia: '⊹ Inteligencia AI ⊹',
  nable: '⊹ Funciones ⊹',
  buscadores: '⊹ Buscadores ⊹',
  descargas: '⊹ Descargas ⊹',
  imagen: '⊹ Imágenes ⊹',
  fun: '⊹ Diversión ⊹',
  game: '⊹ Juegos ⊹',
  anime: '⊹ Anime ⊹',
  grupo: '⊹ Admins ⊹',
  gacha: '⊹ Gacha ⊹',
  text: '⊹ Efectos ⊹',
  rpg: '⊹ Economía ⊹',
  perfil: '⊹ Perfil ⊹',
  sticker: '⊹ Stickers ⊹',
  tools: '⊹ Útilidades ⊹',
  nsfw: '⊹ NSFW ⊹',
  serbot: '⊹ Sub-bots ⊹'
}

const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb7h1qC65yDEhghegc2O'
const DEFAULT_AVATAR = 'https://project-sxl.vercel.app/files/0b1ac71e42ed.jpg'

let cachedBannerBuffer = null
let cachedBannerUrl = null

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error descargando imagen: ${res.status}`)
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

function quotedContext(m) {
  if (!m?.key) return {}
  return {
    stanzaId: m.key.id,
    participant: m.key.participant || m.key.remoteJid,
    quotedMessage: m.message
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
  ctx.lineWidth = 5
  ctx.strokeStyle = '#25D366'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(centerX, centerY, avatarSize / 2 + 4, 0, Math.PI * 2)
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.stroke()

  return canvas.encode('png')
}

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '💔', key: m.key } })

    const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
    
    const byTag = {}
    for (const plugin of pluginsActivos) {
      const tags = Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : [])
      const helps = Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : [])
      for (const tag of tags) {
        if (!CATEGORY_META[tag]) continue
        if (!byTag[tag]) byTag[tag] = new Set()
        for (const h of helps) {
          if (typeof h === 'string' && h.trim()) byTag[tag].add(h.trim())
        }
      }
    }

    const userName = m.pushName || 'Usuario'
    const botnameConfig = getBotConfig(conn, 'botname') || 'Bot'

    const mainBotJid = global.conn?.user?.jid?.split(':')[0]
    const currentBotJid = conn.user?.jid?.split(':')[0]
    const isMainBot = mainBotJid && currentBotJid && mainBotJid === currentBotJid
    const botType = isMainBot ? ' 𝐏𝐫𝐞𝐦-𝐁𝐨𝐭' : '𝐒𝐮𝐛-𝐁𝐨𝐭'

    let menuTexto = ''
    menuTexto += `Hola *${userName}* soy *${botnameConfig}* (${botType})\n`
    menuTexto += `ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs\n`
    menuTexto += `╭┈ ↷\n`
    menuTexto += `│ ✐ 𝓓𝓮𝔀𝓮𝓵𝓸𝓹𝓮𝓭 𝓫𝔂 𝓒𝓪𝓻𝓵𝓸𝓼 💙\n`
    menuTexto += `│ ✐ ꒷ꕤ💎ദ ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ ෴\n`
    menuTexto += `│${CHANNEL_URL}\n`
    menuTexto += `╰─────────────────\n\n`

    for (const tag of Object.keys(CATEGORY_META)) {
      const set = byTag[tag]
      if (!set || set.size === 0) continue
      const cmds = [...set].sort()

      menuTexto += `╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n`
      menuTexto += `╭╼⬪࣪ꥈ𑁍⃪࣭۪ٜ ${CATEGORY_META[tag]} ໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪\n`
      menuTexto += `┃֪࣪  ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`
      menuTexto += cmds.map(c => `├ׁ̟̇❍✎ .${c}`).join('\n') + '\n'
      menuTexto += `╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n\n`
    }

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
      console.error('Canvas error:', e)
    }

    const media = await prepareWAMessageMedia(
      { image: finalBuffer },
      { upload: conn.waUploadToServer }
    )

    const nativeFlowPayload = {
      header: {
        title: null,
        subtitle: `${dev}`,
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      body: { text: menuTexto.trim() },
      footer: { text: `${dev}` },
      nativeFlowMessage: {
        buttons: [],
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: botnameConfig,
            url: CHANNEL_URL,
            copy_code: null,
            expiration_time: null
          }
        })
      },
      contextInfo: {
        mentionedJid: [],
        groupMentions: [],
        ...quotedContext(m)
      }
    }

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: nativeFlowPayload
          }
        }
      },
      {
        quoted: m,
        userJid: conn.user?.jid || conn.user?.id
      }
    )

    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    await conn.sendMessage(m.chat, { text: `✿ Error: ${e.message || e}` }, { quoted: m })
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']

export default handler