import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  const thumbUrl = `https://put.icu/s/ufps0dct.jpg`
  const thumbBuffer = await fetch(thumbUrl).then(res => res.buffer())

  let mensaje = `
╭─❏ ✿ *مطور البوت*
┊ 👤 *الاسم:* 𝐡𝐚𝐢𝐭𝐡𝐚𝐦
┊ 🌐 *جيتهاب:* ${(global.social?.github || '').replace(/^https?:\/\//, '')}
┊ 📱 *تليجرام:* ${(global.social?.telegram || '').replace(/^https?:\/\//, '')}
┊ 📞 *واتساب:* ${(global.social?.whatsapp || '').replace(/^https?:\/\//, '')}
╰─❏ ✿`

  // Preparar media
  const media = await prepareWAMessageMedia(
    { image: thumbBuffer },
    { upload: conn.waUploadToServer }
  )

  const nativeFlowPayload = {
    header: {
      title: null,
      subtitle: 'معلومات التواصل',
      hasMediaAttachment: true,
      imageMessage: media.imageMessage
    },
    body: { text: mensaje.trim() },
    footer: { text: global.dev },
    nativeFlowMessage: {
      buttons: [],
      messageParamsJson: JSON.stringify({
        limited_time_offer: {
          text: '👤 المطور',
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

handler.help = ['مطور']
handler.tags = ['owner']
handler.command = ['creador', 'owner', 'مطور', 'المطور', 'المالك']
handler.owner = false

export default handler