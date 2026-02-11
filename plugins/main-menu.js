import moment from 'moment-timezone'
import pkg from '@whiskeysockets/baileys'

const {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} = pkg

const BANNER_URL = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Datos/8baf438dfe.jpg'

const CATEGORY_META = {
  ai: '🧠 Inteligencia AI',
  downloads: '🚀 Descargas',
  economia: '💰 Economía',
  gacha: '🎌 Gacha / Waifus',
  grupos: '👥 Grupos',
  utilidades: '🔧 Utilidades',
  owner: '👑 Owner',
  info: '📋 Info',
  fun: '🎉 Diversión',
  nsfw: '🔞 NSFW'
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',

  run: async (client, m, args) => {
    try {

      const usedPrefix = global.prefix?.source
        ? global.prefix.source.split(')')[1]?.slice(1, 2) || '/'
        : '/'

      const text = args.join(' ')

      const jam = moment.tz('America/Bogota').format('HH:mm:ss')
      const ucapan = jam < '12:00:00'
        ? '🌅 Buen día'
        : jam < '19:00:00'
          ? '☀️ Buenas tardes'
          : '🌙 Buenas noches'

      const fecha = moment.tz('America/Bogota').format('DD/MM/YYYY')
      const hora = moment.tz('America/Bogota').format('hh:mm A')

      let menuTexto = ''
      let headerTitle = '> ✧ 𝙈𝙚𝙣𝙪 𝙋𝙧𝙞𝙣𝙘𝙞𝙥𝙖𝙡 ✧'

      if (text) {
        const tag = text.toLowerCase().trim()

        if (CATEGORY_META[tag]) {

          headerTitle = `✧ SECCIÓN: ${tag.toUpperCase()} ✧`

          const helps = []
          for (const [cmd, data] of global.comandos.entries()) {
            if (data.category === tag) helps.push(cmd)
          }

          const sortedHelps = [...new Set(helps)].sort()

          menuTexto = `╭─❖ *${CATEGORY_META[tag]}* ❖─╮\n`
          menuTexto += sortedHelps.map(h => `│ • ${usedPrefix}${h}`).join('\n')
          menuTexto += `\n╰───────────────╯`
        }
      }

      if (!menuTexto) {
        menuTexto = `✦━━━━━━━━━━━━━━━━✦\n`
        menuTexto += `   ${ucapan}, *${m.pushName || 'Usuario'}* ✨\n`
        menuTexto += `   📅 Fecha: ${fecha}\n`
        menuTexto += `   🕒 Hora: ${hora}\n`
        menuTexto += `   👤 Creador: Carlos\n`
        menuTexto += `✦━━━━━━━━━━━━━━━━✦\n\n`
        menuTexto += `Presiona el botón de abajo para desplegar las categorías y ver los comandos.`
      }

      await client.sendMessage(m.chat, {
        react: { text: '👿', key: m.key }
      })

      const byTag = {}

      for (const [, data] of global.comandos.entries()) {
        const cat = data.category
        if (!CATEGORY_META[cat]) continue
        byTag[cat] = (byTag[cat] || 0) + 1
      }

      const categoryRows = Object.keys(CATEGORY_META)
        .filter(tag => byTag[tag] > 0)
        .map(tag => ({
          header: 'SECCIÓN',
          title: CATEGORY_META[tag],
          description: `Ver ${byTag[tag]} comandos`,
          id: `${usedPrefix}menu ${tag}`
        }))

      const media = await prepareWAMessageMedia(
        { image: { url: BANNER_URL } },
        { upload: client.waUploadToServer }
      )

      const messageInstance = {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: menuTexto
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: 'ち卄工乙UＫ丹-丹工 • Dev by Carlos'
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: headerTitle,
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '📂 SELECCIONAR CATEGORÍA',
                  sections: [
                    {
                      title: 'Categorías Disponibles',
                      rows: categoryRows
                    }
                  ]
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '💻 Ser Subbot',
                  id: `${usedPrefix}code`
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '👑 Creador',
                  id: `${usedPrefix}owner`
                })
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '📢 Canal Oficial',
                  url: 'https://whatsapp.com/channel/0029VbAVMtj2f3EFmXmrzt0v'
                })
              }
            ]
          })
        })
      }

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: messageInstance.interactiveMessage
            }
          }
        },
        {
          userJid: client.user.id,
          quoted: m
        }
      )

      await client.relayMessage(
        m.chat,
        msg.message,
        { messageId: msg.key.id }
      )

    } catch (e) {
      console.error(e)
      await m.reply(`> *Error en el menú:* ${e.message}`)
    }
  }
}