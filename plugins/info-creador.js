import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  const thumbUrl = `https://files.evogb.win/O5jgc6.jpg`
  const thumbBuffer = await fetch(thumbUrl).then(res => res.buffer())

  let mensaje = `
╭─❏ ✿ *مطور البوت*
┊ 👤 *الاسم:* Carlos
┊ 🌐 *جيتهاب:* github.com/Kone457
┊ 📱 *تليجرام:* t.me/CarlosOfc_xp
┊ 📞 *واتساب:* wa.me/CarlosOfc.CC
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
    footer: { text: '© جميع الحقوق محفوظة' },
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
handler.tags = ['info']
handler.command = ['creador', 'owner', 'مطور', 'المالك']
handler.owner = false

export default handler