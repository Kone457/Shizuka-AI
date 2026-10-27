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
const DEV_NAME = 'Carlos'

let cachedBannerBuffer = null
let cachedBannerUrl = null

async function fetchBuffer(url) {
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Error descargando imagen: ${res.status}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

async function getBannerBuffer(url) {
  if (!url) return null

  if (cachedBannerBuffer && cachedBannerUrl === url) {
    return cachedBannerBuffer
  }

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

function drawCircularImage(
  ctx,
  img,
  x,
  y,
  size,
  borderColor = '#25D366',
  borderWidth = 4
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2,
    0,
    Math.PI * 2
  )
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x, y, size, size)
  ctx.restore()

  ctx.beginPath()
  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2 - borderWidth / 2,
    0,
    Math.PI * 2
  )
  ctx.lineWidth = borderWidth
  ctx.strokeStyle = borderColor
  ctx.stroke()
}

async function generateUserOverlay(avatarBuffer, userName, width, height) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, width, height)

  const avatarSize = Math.max(
    40,
    Math.min(80, Math.floor(Math.min(width, height) * 0.16))
  )

  const paddingX = 20
  const paddingBottom = 20
  const fontSize = Math.max(12, Math.min(15, Math.floor(width * 0.025)))
  const nameGap = 8

  const avatarX = Math.max(
    10,
    width - avatarSize - paddingX
  )

  const avatarY = Math.max(
    10,
    height - avatarSize - paddingBottom - fontSize - nameGap - 12
  )

  const nameX = avatarX + avatarSize / 2
  const nameY = avatarY + avatarSize + nameGap + fontSize / 2

  if (avatarBuffer) {
    try {
      const avatarImg = await loadImage(avatarBuffer)

      drawCircularImage(
        ctx,
        avatarImg,
        avatarX,
        avatarY,
        avatarSize,
        '#25D366',
        4
      )
    } catch {
      ctx.beginPath()
      ctx.arc(
        nameX,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      )
      ctx.fillStyle = '#25D366'
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 35px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        String(userName || 'U').charAt(0).toUpperCase(),
        nameX,
        avatarY + avatarSize / 2
      )
    }
  } else {
    ctx.beginPath()
    ctx.arc(
      nameX,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = '#25D366'
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 35px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      String(userName || 'U').charAt(0).toUpperCase(),
      nameX,
      avatarY + avatarSize / 2
    )
  }

  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const maxNameWidth = Math.max(
    30,
    Math.min(avatarSize + 50, width - 20)
  )

  let displayName = String(userName || 'Usuario').trim()

  if (ctx.measureText(displayName).width > maxNameWidth) {
    while (
      displayName.length > 1 &&
      ctx.measureText(`${displayName}…`).width > maxNameWidth
    ) {
      displayName = displayName.slice(0, -1)
    }

    displayName += '…'
  }

  const textWidth = ctx.measureText(displayName).width
  const boxPaddingX = 8
  const boxPaddingY = 4
  const boxWidth = textWidth + boxPaddingX * 2
  const boxHeight = fontSize + boxPaddingY * 2

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
  ctx.beginPath()
  ctx.roundRect(
    nameX - boxWidth / 2,
    nameY - boxHeight / 2,
    boxWidth,
    boxHeight,
    8
  )
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.fillText(displayName, nameX, nameY)

  return canvas.encode('png')
}

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '💔',
        key: m.key
      }
    })

    const pluginsActivos = Object.values(global.plugins || {})
      .filter(plugin => !plugin?.disabled)

    const byTag = {}

    for (const plugin of pluginsActivos) {
      const tags = Array.isArray(plugin.tags)
        ? plugin.tags
        : plugin.tags
          ? [plugin.tags]
          : []

      const helps = Array.isArray(plugin.help)
        ? plugin.help
        : plugin.help
          ? [plugin.help]
          : []

      for (const tag of tags) {
        if (!CATEGORY_META[tag]) continue

        if (!byTag[tag]) {
          byTag[tag] = new Set()
        }

        for (const help of helps) {
          if (typeof help === 'string' && help.trim()) {
            byTag[tag].add(help.trim())
          }
        }
      }
    }

    const userName = String(m.pushName || 'Usuario')
    const botnameConfig = getBotConfig(conn, 'botname') || 'Bot'

    const mainBotJid = global.conn?.user?.jid?.split(':')[0]
    const currentBotJid = conn.user?.jid?.split(':')[0]

    const isMainBot = Boolean(
      mainBotJid &&
      currentBotJid &&
      mainBotJid === currentBotJid
    )

    const botType = isMainBot
      ? '𝐏𝐫𝐞𝐦-𝐁𝐨𝐭'
      : '𝐒𝐮𝐛-𝐁𝐨𝐭'

    let menuTexto = ''

    menuTexto += `Hola *${userName}* soy *${botnameConfig}* (${botType})\n`
    menuTexto += `ᴀǫᴜɪ ᴛɪᴇɴᴇs ʟᴀ ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs\n`
    menuTexto += `╭┈ ↷\n`
    menuTexto += `│ ✐ 𝓓𝓮𝔀𝓮𝓵𝓸𝓹𝓮𝓭 𝓫𝔂 ${DEV_NAME} 💙\n`
    menuTexto += `│ ✐ ꒷ꕤ💎ദ ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ ෴\n`
    menuTexto += `│ ${CHANNEL_URL}\n`
    menuTexto += `╰─────────────────\n\n`

    for (const tag of Object.keys(CATEGORY_META)) {
      const set = byTag[tag]

      if (!set || set.size === 0) continue

      const cmds = [...set].sort()

      menuTexto += `╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮\n`
      menuTexto += `╭╼⬪࣪ꥈ𑁍⃪࣭۪ٜ ${CATEGORY_META[tag]} ໑⃪࣭۪ٜ݊݊݊݊𑁍ꥈ࣪⬪\n`
      menuTexto += `┃֪࣪  ╰─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬❖⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╯\n`
      menuTexto += cmds.map(command => `├ׁ̟̇❍✎ .${command}`).join('\n') + '\n'
      menuTexto += `╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯\n\n`
    }

    const bannerUrl = getBotConfig(conn, 'banner2')
    const bannerBuffer = await getBannerBuffer(bannerUrl)

    if (!bannerBuffer) {
      return await conn.sendMessage(
        m.chat,
        { text: menuTexto.trim() },
        { quoted: m }
      )
    }

    let avatarBuffer = null

    try {
      const ppUrl = await conn.profilePictureUrl(m.sender, 'image')
        .catch(() => null)

      if (ppUrl) {
        avatarBuffer = await fetchBuffer(ppUrl)
      }
    } catch {}

    if (!avatarBuffer) {
      try {
        avatarBuffer = await fetchBuffer(DEFAULT_AVATAR)
      } catch {}
    }

    let finalBuffer = bannerBuffer

    try {
      const bannerImg = await loadImage(bannerBuffer)

      const canvas = createCanvas(
        bannerImg.width,
        bannerImg.height
      )

      const ctx = canvas.getContext('2d')

      ctx.drawImage(
        bannerImg,
        0,
        0,
        bannerImg.width,
        bannerImg.height
      )

      const overlayBuffer = await generateUserOverlay(
        avatarBuffer,
        userName,
        bannerImg.width,
        bannerImg.height
      )

      const overlayImg = await loadImage(overlayBuffer)

      ctx.drawImage(
        overlayImg,
        0,
        0,
        bannerImg.width,
        bannerImg.height
      )

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
        title: botnameConfig,
        subtitle: DEV_NAME,
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      body: {
        text: menuTexto.trim()
      },
      footer: {
        text: DEV_NAME
      },
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

    return await conn.relayMessage(
      m.chat,
      msg.message,
      { messageId: msg.key.id }
    )
  } catch (e) {
    console.error('Error en el menú:', e)

    return await conn.sendMessage(
      m.chat,
      { text: `✿ Error: ${e.message || e}` },
      { quoted: m }
    )
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = ['menu', 'help']

export default handler