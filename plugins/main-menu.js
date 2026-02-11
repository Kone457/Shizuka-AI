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

    } catch (e) {

    }
  }

  return categories
}


export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',

  run: async (client, m, args) => {
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

      const botname = botSettings.namebot || ''
      const botname2 = botSettings.namebot2 || ''
      const banner = botSettings.banner || ''
      const owner = botSettings.owner || ''

      const canalId = botSettings.id || '120363400241973967@newsletter'
      const canalName = botSettings.nameid || '（´•̥̥̥ω•̥̥̥`）♡ 𝑆ℎ𝑖𝑧𝑢𝑘𝑎-𝐴𝐼 ♡（´•̥̥̥ω•̥̥̥`）'
      const link = botSettings.link || bot.api
      const prefix = botSettings.prefijo || '/'

      const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
      const isPremiumBot = botSettings.botprem === true
      const isModBot = botSettings.botmod === true

      const botType = isOficialBot
        ? 'Principal *(Owner)*'
        : isPremiumBot
          ? 'Premium'
          : isModBot
            ? 'Principal *(Mod)*'
            : 'Sub Bot'

      const users = Object.keys(global.db.data.users).length
      const device = getDevice(m.key.id)
      const sender = global.db.data.users[m.sender]?.name || m.pushName || 'Usuario'

      const uptime = client.uptime
        ? formatearMs(Date.now() - client.uptime)
        : 'Desconocido'

      const commandMap = await loadCommandsByCategory()

      const categoryNames = {
        ai: '𝑰𝑨',
        downloads: '𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒔',
        economia: '𝑬𝒄𝒐𝒏𝒐𝒎𝒊𝒂',
        gacha: '𝑮𝒂𝒄𝒉𝒂 / 𝑾𝒂𝒊𝒇𝒖𝒔',
        grupos: '𝑮𝒓𝒖𝒑𝒐𝒔',
        utilidades: '𝑼𝒕𝒊𝒍𝒊𝒅𝒂𝒅𝒆𝒔',
        owner: '𝑶𝒘𝒏𝒆𝒓',
        info: '𝑰𝒏𝒇𝒐',
        fun: '𝑫𝒊𝒗𝒆𝒓𝒔𝒊𝒐𝒏',
        nsfw: '𝑵𝑺𝑭𝑾'
      }

      let dynamicMenu = ''

      for (const [cat, cmds] of Object.entries(commandMap)) {

        const title =
          categoryNames[cat] ||
          cat.toUpperCase()

        dynamicMenu += `
╭─༺🕸️ ${title} 🕸️༻─╮
${[...cmds].sort().map(c => `│ 🕷️ ${c}`).join('\n')}
╰────────────╯
`
      }

      let menu = `
*🕷️ 𝓗𝓸𝓵𝓪, $sender 🕷️*

┏━━━༺🕸️ 𝑬𝑺𝑻𝑨𝑫𝑶 🕸️༻━━━┓
┃ 🕷️ 𝑼𝒔𝒖𝒂𝒓𝒊𝒐 ➜ $sender
┃ 🕸️ 𝑩𝒐𝒕 ➜ $botType
┃ ⌛ 𝑯𝒐𝒓𝒂 ➜ $tiempo2
┃ 🕸️ 𝑭𝒆𝒄𝒉𝒂 ➜ $tiempo
┃ 🕷️ 𝑼𝒑𝒕𝒊𝒎𝒆 ➜ $uptime
┃ 🕸️ 𝑼𝒔𝒖𝒂𝒓𝒊𝒐𝒔 ➜ $users
┃ 🕷️ 𝑫𝒊𝒔𝒑𝒐𝒔𝒊𝒕𝒊𝒗𝒐 ➜ $device
┗━━━━━━━━━━━━━━━━━━━━┛

*🕷️ ✦ 𝑴 𝑬 𝑵 𝑼 ✦ 🕷️*

${dynamicMenu}

🕸️ Usa ${prefix}help <comando> para más info.
`.trim()

      const replacements = {
        $botType: botType,
        $device: device,
        $tiempo: tiempo,
        $tiempo2: tiempo2,
        $users: users.toLocaleString() || '0',
        $sender: sender,
        $prefix: prefix,
        $uptime: uptime
      }

      for (const [key, value] of Object.entries(replacements)) {
        menu = menu.replace(new RegExp(`\\${key}`, 'g'), value)
      }

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
                body: `${botname2}`,
                showAdAttribution: false,
                thumbnailUrl: banner,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: m }
        )

      }

    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
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