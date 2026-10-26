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

function drawCircularImage(ctx, img, x, y, size, borderColor = '#25D366', borderWidth = 4) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x, y, size, size)
  ctx.restore()

  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.lineWidth = borderWidth
  ctx.strokeStyle = borderColor
  ctx.stroke()
}

async function generateUserOverlay(avatarBuffer, userName, width, height) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const avatarSize = 90
  const padding = 18
  const avatarX = width - avatarSize - padding
  const avatarY = padding

  ctx.save()
  ctx.beginPath()
  const boxW = avatarSize + 30
  const boxH = avatarSize + 50
  const boxX = avatarX - 15
  const boxY = avatarY - 10
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
  ctx.roundRect(boxX, boxY, boxW, boxH, 14)
  ctx.fill()
  ctx.restore()

  try {
    const avatarImg = await loadImage(avatarBuffer)
    drawCircularImage(ctx, avatarImg, avatarX, avatarY, avatarSize)
  } catch {
    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = '#25D366'
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 40px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText((userName[0] || '?').toUpperCase(), avatarX + avatarSize / 2, avatarY + avatarSize / 2)
  }

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const maxNameWidth = avatarSize + 20
  let displayName = userName
  while (ctx.measureText(displayName).width > maxNameWidth && displayName.length > 3) {
    displayName = displayName.slice(0, -1)
  }
  if (displayName !== userName) displayName = displayName.slice(0, -2) + '…'

  ctx.fillText(displayName, avatarX + avatarSize / 2, avatarY + avatarSize + 8)

  return canvas.encode('png')
}

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '💔', key: m.key } })

    const pluginsActivos = Object.values(global.plugins || {}).filter(p => !p?.disabled)
    const fecha = moment.tz('America/Havana').format('DD/MM/YYYY')
    const hora = moment.tz('America/Havana').format('hh:mm A')

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

      if (avatarBuffer) {
        const overlayBuffer = await generateUserOverlay(avatarBuffer, userName, bannerImg.width, bannerImg.height)
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