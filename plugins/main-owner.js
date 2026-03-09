import fs from 'fs'

export default {
  command: ['creator', 'owner', 'creador'],
  category: 'info',

  run: async (client, m) => {

    const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
    const botSettings = global.db.data.settings[botId] || {}

    const owner = botSettings.owner || '+5355699866@s.whatsapp.net'
    const botname = botSettings.namebot || 'Bot'
    const banner = botSettings.banner || ''

    const ownerNumber = owner.split('@')[0]

    const text = `
╭━〔 ˚୨•(=^●ω●^=)• ⊹ 𝑪𝑹𝑬𝑨𝑫𝑶𝑹 ⊹ •(=^●ω●^=)•୨˚ 〕━╮

» ˚୨•(=^●ω●^=)• ⊹ Información ⊹

➤ Creador: @${ownerNumber}
➤ Bot: ${botname}
➤ Contacto disponible abajo

──────────────

✧ Gracias por usar el bot ✧

╰━━━━━━━━━━━━━━━━━━━━╯
`.trim()

    const contact = {
      key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Creator"
      },
      message: {
        contactMessage: {
          displayName: botname,
          vcard: `BEGIN:VCARD
VERSION:3.0
N:;Owner;;;
FN:Owner
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD`
        }
      }
    }

    if (banner) {

      await client.sendMessage(
        m.chat,
        {
          image: { url: banner },
          caption: text,
          mentions: [owner]
        },
        { quoted: contact }
      )

    } else {

      await client.sendMessage(
        m.chat,
        {
          text: text,
          mentions: [owner]
        },
        { quoted: contact }
      )

    }

  }
}