import fetch from 'node-fetch'
import { default as WA, proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('> Ingresa el nombre de usuario o palabra clave para buscar en Instagram.')

  try {
    const res = await fetch(`https://api.vreden.my.id/api/v1/search/instagram/users?query=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !json.result?.search_data?.length) {
      return m.reply('> No se encontraron perfiles para tu búsqueda.')
    }

    const cards = []
    const users = json.result.search_data.slice(0, 10)

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      let headerObj

      try {
        const imgBuffer = await (await fetch(user.profile_pic_url)).buffer()
        const media = await prepareWAMessageMedia({ image: imgBuffer }, { upload: conn.waUploadToServer })
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: true, imageMessage: media.imageMessage })
      } catch {
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
      }

      const bodyText = `👤 ${user.full_name || 'Sin nombre'}\n🔗 @${user.username}\n🔒 Privado: ${user.is_private ? 'Sí' : 'No'}`
      const footerText = `📱 Resultado ${i + 1}`

      const card = {
        header: headerObj,
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: bodyText }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: footerText }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🌐 Ver perfil',
                url: `https://instagram.com/${user.username}`
              })
            }
          ]
        })
      }

      cards.push(card)
    }

    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ text: `✧ Resultados de Instagram para *${json.result.query}*` }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: `Total: ${json.result.count} perfiles` }),
      header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
      carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
    })

    const messageContent = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: interactive
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })

  } catch (e) {
    console.error('[Instagram Search Carrusel] Error:', e)
    await conn.sendMessage(m.chat, { text: `🕸 Error [${e.message || e}]` }, { quoted: m })
  }
}

handler.help = ['userig <texto>']
handler.tags = ['buscadores']
handler.command = ['igsearch', 'instasearch', 'userig']

export default handler