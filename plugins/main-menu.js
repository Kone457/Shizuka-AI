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
            const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net'
            const botSettings = global.db.data.settings[botId] || {}
            
            const timeZone = 'America/Bogota'
            const tiempo = moment.tz(timeZone).format('DD/MM/YYYY')
            const tiempo2 = moment.tz(timeZone).format('HH:mm')
            
            const botname = botSettings.namebot || 'Shizuka - AI'
            const botname2 = botSettings.namebot2 || 'Simple & Elegant'
            const banner = botSettings.banner || ''
            const owner = botSettings.owner || ''
            const canalId = botSettings.id || '120363400241973967@newsletter'
            const canalName = botSettings.nameid || 'Shizuka AI Updates'
            const prefix = botSettings.prefijo || '/'

            const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
            const botType = isOficialBot ? 'Oficial' : (botSettings.botprem ? 'Premium' : 'Sub-Bot')
            const users = Object.keys(global.db.data.users).length
            const device = getDevice(m.key.id)
            const sender = global.db.data.users[m.sender]?.name || m.pushName || 'User'
            const uptime = client.uptime ? formatearMs(Date.now() - client.uptime) : '0s'

            const commandMap = await loadCommandsByCategory()
            const categoryNames = {
                ai: 'INTELIGENCIA ARTIFICIAL',
                downloads: 'DESCARGAS',
                economia: 'ECONOMÍA',
                gacha: 'GACHA & WAIFUS',
                grupos: 'GESTIÓN DE GRUPOS',
                utilidades: 'UTILIDADES',
                owner: 'OPCIONES DE DUEÑO',
                info: 'INFORMACIÓN',
                fun: 'ENTRETENIMIENTO',
                nsfw: 'CONTENIDO +18'
            }

            let dynamicMenu = ''
            for (const [cat, cmds] of Object.entries(commandMap)) {
                const title = categoryNames[cat] || cat.toUpperCase()
                dynamicMenu += `\n─── ✧ *${title}* ✧ ───\n`
                dynamicMenu += `${[...cmds].sort().map(c => `  ◈ ${prefix}${c}`).join('\n')}\n`
            }

            let menu = `
╔════════════════════╗
      *${botname.toUpperCase()}*
╚════════════════════╝

  ┏  ✨ *S T A T S*
  ┃ 
  ┃ 👤 *Cliente:* ${sender}
  ┃ 🤖 *Rango:* ${botType}
  ┃ ⏱️ *Uptime:* ${uptime}
  ┃ 👥 *Usuarios:* ${users}
  ┃ 📅 *Fecha:* ${tiempo}
  ┃ ⏰ *Hora:* ${tiempo2}
  ┃ 📱 *Dispositivo:* ${device}
  ┗━━━━━━━━━━━━━━━━━━┛

${dynamicMenu}
> 💡 _Tip: Usa ${prefix}help <comando> para detalles._`.trim()

            const context = {
                mentionedJid: [owner, m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: { 
                    newsletterJid: canalId, 
                    serverMessageId: '0', 
                    newsletterName: canalName 
                }
            }

            if (banner && (banner.endsWith('.mp4') || banner.endsWith('.gif'))) {
                await client.sendMessage(m.chat, { video: { url: banner }, gifPlayback: true, caption: menu, contextInfo: context }, { quoted: m })
            } else {
                await client.sendMessage(m.chat, { 
                    text: menu, 
                    contextInfo: { 
                        ...context,
                        externalAdReply: { 
                            title: botname, 
                            body: botname2, 
                            thumbnailUrl: banner, 
                            mediaType: 1, 
                            renderLargerThumbnail: true 
                        } 
                    } 
                }, { quoted: m })
            }
        } catch (e) {
            console.error(e)
        }
    }
}

function formatearMs(ms) {
    const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
    return [d && `${d}d`, h % 24 + 'h', m % 60 + 'm', s % 60 + 's'].filter(Boolean).join(' ')
}
