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
      const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]  
      const cat = (plugin.category || 'otros').toLowerCase()  
      if (!categories[cat]) categories[cat] = new Set()  
      cmds.forEach(c => { if (typeof c === 'string') categories[cat].add(c) })  
    } catch (e) {}
  }
  return categories
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',

  run: async (client, m, args) => {
    try {
      const tiempo = moment.tz('America/Bogota').format('DD MMM YYYY')
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')  
      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''  
      const botSettings = global.db?.data?.settings?.[botId] || {}  
      const botname = botSettings.namebot || ''  
      const botname2 = botSettings.namebot2 || ''  
      const banner = botSettings.banner || ''  
      const owner = botSettings.owner || ''  
      const canalId = botSettings.id || '120363400241973967@newsletter'  
      const canalName = botSettings.nameid || '（´•̥̥̥ω•̥̥̥`）♡ 𝑆ℎ𝑖𝑧𝑢𝑘𝑎-𝐴𝐼 ♡（´•̥̥̥ω•̥̥̥`）'  
      const isOficialBot = botId === global.client?.user?.id.split(':')[0] + '@s.whatsapp.net'  
      const botType = isOficialBot ? 'Principal  *(Owner)*' : botSettings.botprem ? 'Premium' : botSettings.botmod ? 'Principal *(Mod)*' : 'Sub Bot'  
      const users = Object.keys(global.db?.data?.users || {}).length.toLocaleString() || '0'
      const device = getDevice(m.key.id)  
      const sender = global.db?.data?.users?.[m.sender]?.name || m.pushName || 'Usuario'  
      const uptime = client.uptime ? formatearMs(Date.now() - client.uptime) : 'Desconocido'  
      const commandMap = await loadCommandsByCategory()  

      const categoryNames = {  
        ai: '🤖 𝑰 𝑨𝒓𝒕𝒊𝒇𝒊𝒄𝒊𝒂𝒍',  
        downloads: '📥 𝑫𝒆𝒔𝒄𝒂𝒓𝒈𝒂𝒔',  
        economia: '💰 𝑬𝒄𝒐𝒏𝒐𝒎𝒊𝒂',  
        gacha: '🎰 𝑮𝒂𝒄𝒉𝒂 / 𝑾𝒂𝒊𝒇𝒖𝒔',  
        grupos: '⚙️ 𝑮𝒓𝒖𝒑𝒐𝒔',  
        utilidades: '🛠️ 𝑼𝒕𝒊𝒍𝒊𝒅𝒂𝒅𝒆𝒔',  
        owner: '👑 𝑶𝒘𝒏𝒆𝒓',  
        info: 'ℹ️ 𝑰𝒏𝒇𝒐',  
        fun: '🎮 𝑫𝒊𝒗𝒆𝒓𝒔𝒊𝒐𝒏',  
        nsfw: '🔞 𝑵𝑺𝑭𝑾'  
      }  

      let dynamicMenu = ''  
      for (const [cat, cmds] of Object.entries(commandMap)) {  
        const title = categoryNames[cat] || `🔰 ${cat.toUpperCase()}`
        dynamicMenu += `\n╭─「 ✦ ${title} ✦ 」\n${[...cmds].sort().map(c => `│ ∘ ➪ #${c}`).join('\n')}\n╰───────────────\n`
      }

      const menu = `
✧ 💖 ¡Hola, *${sender}*! 💖 ✧

╭─━━ 📊 *STATUS* 📊 ━━─╮
│ 👤 *Usuario:* ${sender}
│ 🤖 *Bot:* *${botType}*
│ 🕒 *Hora:* \`${tiempo2}\`
│ 📅 *Fecha:* \`${tiempo}\`
│ ⏳ *Activo:* ${uptime}
│ 👥 *Usuarios:* *${users}*
│ 📱 *Disp:* ${device}
╰━━━━━━━━━━━━━━━━━━─╯

✦ ✧ 𝑴 𝑬 𝑵 𝑼 ✧ ✦
${dynamicMenu}
✧ Usa #help <comando> para más info.
`.trim()

      const contextConfig = {
        mentionedJid: [owner, m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: canalId,
          serverMessageId: '0',
          newsletterName: canalName
        }
      }

      const isVideo = banner && (banner.endsWith('.mp4') || banner.endsWith('.gif') || banner.endsWith('.webm'))
      const msgData = isVideo ? { video: { url: banner }, gifPlayback: true, caption: menu, contextInfo: contextConfig } : { text: menu, contextInfo: { ...contextConfig, externalAdReply: { title: botname, body: botname2, thumbnailUrl: banner, mediaType: 1, renderLargerThumbnail: true } } }

      await client.sendMessage(m.chat, msgData, { quoted: m })  

    } catch (e) {  
      console.error(e)
      await m.reply('❌ Error en el menú.')  
    }
  }
}

function formatearMs(ms) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
  return [`${d ? `${d}d` : ''}`, `${h % 24}h`, `${m % 60}m`, `${s % 60}s`].filter(Boolean).join(' ')
}
