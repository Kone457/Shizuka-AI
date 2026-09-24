import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  const thumbUrl = `https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/18a2f50ee4.jpg`
  const thumbBuffer = await fetch(thumbUrl).then(res => res.buffer())

  let mensaje = `
╭─❏ ✿ *Creador del Bot*
┊ 👤 *Nombre:* Carlos
┊ 🌐 *Github:* github.com/Kone457
┊ 📱 *Telegram:* t.me/CarlosOfc_xp
┊ 📞 *WhatsApp:* No disponible
╰─❏ ✿`

  // Preparar media
  const media = await prepareWAMessageMedia(
    { image: thumbBuffer },
    { upload: conn.waUploadToServer }
  )

  const nativeFlowPayload = {
    header: {
      title: null,
      subtitle: 'Información de contacto',
      hasMediaAttachment: true,
      imageMessage: media.imageMessage
    },
    body: { text: mensaje.trim() },
    footer: { text: '© Todos los derechos reservados' },
    nativeFlowMessage: {
      buttons: [],
      messageParamsJson: JSON.stringify({
        limited_time_offer: {
          text: '👤 Creador',
          url: thumbUrl,
          copy_code: null,
          expiration_time: null
        }
      })
    },
    contextInfo: {
      mentionedJid: [],
      groupMentions: []
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

  return await conn.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id
  })
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['creador', 'owner']
handler.owner = false

export default handler