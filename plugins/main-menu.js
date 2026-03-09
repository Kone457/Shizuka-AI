import fetch from 'node-fetch'
import { getDevice } from '@whiskeysockets/baileys'
import fs from 'fs'
import axios from 'axios'
import moment from 'moment-timezone'

async function loadCommandsByCategory() {
  const pluginsPath = new URL('.', import.meta.url)
  const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'))

  const categories = {}

  for (const file of files) {
    try {
      const plugin = (await import(`./${file}?update=${Date.now()}`)).default

      if (!plugin || !plugin.command) continue

      const cmds = Array.isArray(plugin.command)
        ? plugin.command
        : [plugin.command]

      const cat = (plugin.category || 'otros').toLowerCase()

      if (!categories[cat]) categories[cat] = new Set()

      cmds.forEach(c => {
        if (typeof c === 'string') categories[cat].add(c)
      })

    } catch {}
  }

  return categories
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',

  run: async (client, m) => {
    try {

      const now = new Date()
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))

      const tiempo = colombianTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/,/g, '')

      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
      const botSettings = global.db.data.settings[botId] || {}

      const botname = botSettings.namebot || 'Bot'
      const botname2 = botSettings.namebot2 || ''
      const banner = botSettings.banner || ''
      const owner = botSettings.owner || ''

      const canalId = botSettings.id || '120363400241973967@newsletter'
      const canalName = botSettings.nameid || 'Shizuka AI'

      const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
      const isPremiumBot = botSettings.botprem === true
      const isModBot = botSettings.botmod === true

      const botType = isOficialBot
        ? 'Principal (Owner)'
        : isPremiumBot
        ? 'Premium'
        : isModBot
        ? 'Principal (Mod)'
        : 'Sub Bot'

      const users = Object.keys(global.db.data.users).length
      const device = getDevice(m.key.id)
      const sender = global.db.data.users[m.sender]?.name || m.pushName || 'Usuario'

      const uptime = client.uptime
        ? formatearMs(Date.now() - client.uptime)
        : 'Desconocido'

      const commandMap = await loadCommandsByCategory()

      const categoryNames = {
        main: '» ˚୨•(=^●ω●^=)• ⊹ `Main` ⊹',
        ai: '» ˚୨•(=^●ω●^=)• ⊹ `Inteligencia AI` ⊹',
        buscadores: '» ˚୨•(=^●ω●^=)• ⊹ `Buscadores` ⊹',
        downloads: '» ˚୨•(=^●ω●^=)• ⊹ `Descargas` ⊹',
        economia: '» ˚୨•(=^●ω●^=)• ⊹ `Economía` ⊹',
        gacha: '» ˚୨•(=^●ω●^=)• ⊹ `Gacha` ⊹',
        grupos: '» ˚୨•(=^●ω●^=)• ⊹ `Admins` ⊹',
        utilidades: '» ˚୨•(=^●ω●^=)• ⊹ `Utilidades` ⊹',
        fun: '» ˚୨•(=^●ω●^=)• ⊹ `Diversión` ⊹',
        info: '» ˚୨•(=^●ω●^=)• ⊹ `Información` ⊹',
        nsfw: '» ˚୨•(=^●ω●^=)• ⊹ `NSFW` ⊹',
        owner: '» ˚୨•(=^●ω●^=)• ⊹ `Owner` ⊹'
      }

      let dynamicMenu = ''

      for (const [cat, cmds] of Object.entries(commandMap)) {

        const title = categoryNames[cat] || `» ˚୨•(=^●ω●^=)• ⊹ \`${cat.toUpperCase()}\` ⊹`

        dynamicMenu += `
${title}

${[...cmds].sort().map(c => `➤ #${c}`).join('\n')}

──────────────
`
      }

      let menu = `
╭━〔 ˚୨•(=^●ω●^=)• ⊹ 𝑴𝑬𝑵𝑼 ⊹ •(=^●ω●^=)•୨˚ 〕━╮

✧ Hola ${sender}

» ˚୨•(=^●ω●^=)• ⊹ 𝑬𝑺𝑻𝑨𝑫𝑶 ⊹

➤ Usuario: ${sender}
➤ Bot: ${botType}
➤ Hora: ${tiempo2}
➤ Fecha: ${tiempo}
➤ Uptime: ${uptime}
➤ Usuarios: ${users}
➤ Dispositivo: ${device}

──────────────

${dynamicMenu}

✧ Usa #help comando para ver información.

╰━━━━━━━━━━━━━━━━━━━━╯
`.trim()

      if (banner && (banner.endsWith('.mp4') || banner.endsWith('.gif') || banner.endsWith('.webm'))) {

        await client.sendMessage(
          m.chat,
          {
            video: { url: banner },
            gifPlayback: true,
            caption: menu,
            contextInfo: {
              mentionedJid: [owner, m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: canalId,
                serverMessageId: '0',
                newsletterName: canalName
              }
            }
          },
          { quoted: m }
        )

      } else {

        await client.sendMessage(
          m.chat,
          {
            text: menu,
            contextInfo: {
              mentionedJid: [owner, m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: canalId,
                serverMessageId: '0',
                newsletterName: canalName
              },
              externalAdReply: {
                title: botname,
                body: botname2,
                thumbnailUrl: banner,
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: m }
        )

      }

    } catch (e) {
      console.error(e)
      await m.reply('❌ Error mostrando el menú.')
    }
  }
}

function formatearMs(ms) {

  const segundos = Math.floor(ms / 1000)
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)

  return [dias && `${dias}d`, `${horas % 24}h`, `${minutos % 60}m`, `${segundos % 60}s`]
    .filter(Boolean)
    .join(' ')
}