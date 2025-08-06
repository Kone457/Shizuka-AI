import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { format } from 'util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const botname = global.botname
const textbot = global.textbot
const banner = global.banner
const redes = global.redes
const channelRD = global.channelRD

let handler = async (m, { conn, args }) => {
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let user = global.db.data.users[userId]
    let name = conn.getName(userId)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = 0
    let tags = {}
    let plugins = {}
    
    let pluginFolders = [
        path.join(__dirname, '..', 'plugins'),
        // Puedes agregar más carpetas si tus plugins están en otros directorios
    ]

    for (const folder of pluginFolders) {
        const files = fs.readdirSync(folder)
        for (const filename of files) {
            if (filename.endsWith('.js')) {
                try {
                    let pluginPath = path.join(folder, filename)
                    let module = await import(`file://${pluginPath}?update=${Date.now()}`)
                    let commands = module.default.handler
                    
                    if (commands && commands.help && commands.tags) {
                        totalCommands += commands.help.length
                        commands.tags.forEach(tag => {
                            if (!tags[tag]) {
                                tags[tag] = []
                            }
                            tags[tag].push(commands.help)
                        })
                    }
                } catch (e) {
                    console.error(`Error al cargar el plugin ${filename}:`, e)
                }
            }
        }
    }
    
    let tagsMapping = {
        'main': '✨ *I N F O - B O T*',
        'group': '👥 *G R U P O S*',
        'downloader': '📥 *D E S C A R G A S*',
        'sticker': '🖼️ *S T I C K E R S*',
        'tools': '🧰 *H E R R A M I E N T A S*',
        'fun': '🎲 *A C C I O N E S*',
        'owner': '👑 *P R O P I E T A R I O*',
        'ai': '🤖 *I N T E L I G E N C I A   A R T I F I C I A L*',
        'audio': '🎵 *A U D I O S*',
        'rpg': '💰 *E C O N O M Í A*',
        'anime': '🎌 *A N I M E*',
        'database': '💾 *D A T A B A S E*',
        'search': '🔍 *B U S C A D O R E S*',
        'info': 'ℹ️ *I N F O*',
    }

    let txt = `
╭━━〔 🌟 𝘽𝙞𝙚𝙣𝙫𝙚𝙣𝙞𝙙𝙤 🌟 〕━╮
┃ ¡Hola @${userId.split('@')[0]}!
┃ Soy *${botname}*, tu asistente virtual.
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 📊 𝙀𝙨𝙩𝙖𝙙𝙞́𝙨𝙩𝙞𝙘𝙖𝙨 〕━━━╮
┃ 🕒 Tiempo activo: *${uptime}*
┃ 👥 Usuarios registrados: *${totalreg}*
┃ 📚 Comandos disponibles: *${totalCommands}*
╰━━━━━━━━━━━━━━━━━━━━━╯
    `

    for (let tag in tags) {
        if (tagsMapping[tag]) {
            txt += `\n╭━━━〔 ${tagsMapping[tag]} 〕━━━╮\n`
            let commands = tags[tag].flat()
            commands.forEach(command => {
                txt += `┃ ⚙️ #${command}\n`
            })
            txt += `╰━━━━━━━━━━━━━━━━━━━━╯\n`
        }
    }

    await conn.sendMessage(m.chat, { 
        text: txt,
        contextInfo: {
            mentionedJid: [m.sender, userId],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: channelRD.id,
                newsletterName: channelRD.name,
                serverMessageId: -1,
            },
            forwardingScore: 999,
            externalAdReply: {
                title: botname,
                body: textbot,
                thumbnailUrl: banner,
                sourceUrl: redes,
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true,
            },
        },
    }, { quoted: m })

}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help']

export default handler

function clockString(ms) {
    let d = Math.floor(ms / (1000 * 60 * 60 * 24))
    let h = Math.floor((ms / (1000 * 60 * 60)) % 24)
    let m = Math.floor((ms / (1000 * 60)) % 60)
    let s = Math.floor((ms / 1000) % 60)
    let dDisplay = d > 0 ? d + (d === 1 ? " día, " : " días, ") : ""
    let hDisplay = h > 0 ? h + (h === 1 ? " hora, " : " horas, ") : ""
    let mDisplay = m > 0 ? m + (m === 1 ? " minuto, " : " minutos, ") : ""
    let sDisplay = s > 0 ? s + (s === 1 ? " segundo" : " segundos") : ""
    return dDisplay + hDisplay + mDisplay + sDisplay
}
