import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { format } from 'util'

// Asegúrate de que estas variables estén definidas en tu archivo global.js
const botname = global.botname || 'Shizuka-AI'
const textbot = global.textbot || 'Asistente virtual de WhatsApp'
const banner = global.banner || 'https://telegra.ph/file/a014909a39f67a29e2c65.jpg'
const redes = global.redes || 'https://chat.whatsapp.com/G5v3lHn3w0x04kP2b39q31'
const channelRD = global.channelRD || { id: '120363297750821010@newsletter', name: 'Shizuka-AI Channel' }


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, args }) => {
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let user = global.db.data.users[userId]
    let name = conn.getName(userId)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let totalCommands = 0
    let tags = {}
    
    // Directorios donde se encuentran tus plugins.
    // Puedes agregar más carpetas si tus plugins están en otros lugares.
    let pluginFolders = [
        path.join(__dirname, '..', 'plugins')
    ]

    for (const folder of pluginFolders) {
        const files = fs.readdirSync(folder)
        for (const filename of files) {
            if (filename.endsWith('.js')) {
                try {
                    let pluginPath = path.join(folder, filename)
                    let module = await import(`file://${pluginPath}?update=${Date.now()}`)
                    let commands = module.default
                    
                    if (commands && commands.handler && commands.handler.help && commands.handler.tags) {
                        commands.handler.tags.forEach(tag => {
                            if (!tags[tag]) {
                                tags[tag] = []
                            }
                            // Agregar los comandos de 'help' al array del tag
                            tags[tag].push(...commands.handler.help)
                            totalCommands += commands.handler.help.length
                        })
                    }
                } catch (e) {
                    console.error(`Error al cargar el plugin ${filename}:`, e)
                }
            }
        }
    }

    // Mapeo de tags a títulos de menú con emojis
    let tagsMapping = {
        'main': '✨ *P R I N C I P A L*',
        'info': 'ℹ️ *I N F O R M A C I Ó N*',
        'rg': '📝 *R E G I S T R O*',
        'serbot': '🤖 *S U B - B O T*',
        'tools': '🧰 *H E R R A M I E N T A S*',
        'transformador': '🔄 *C O N V E R S O R E S*',
        'imagen': '🎨 *I M Á G E N E S*',
        'descargas': '📥 *D E S C A R G A S*',
        'ia': '🧠 *I N T E L I G E N C I A   A R T I F I C I A L*',
        'fun': '🤣 *E N T R E T E N I M I E N T O*',
        'game': '🎮 *J U E G O S*',
        'anime': '🎌 *A N I M E*',
        'gacha': '🎰 *G A C H A*',
        'grupo': '👥 *G R U P O S*',
        'sticker': '🧩 *S T I C K E R S*',
        'rpg': '💰 *E C O N O M Í A   Y   R P G*',
        'owner': '👑 *P R O P I E T A R I O*',
        'nsfw': '🔞 *C O N T E N I D O   + 1 8*',
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
        if (tagsMapping[tag] && tags[tag].length > 0) {
            txt += `\n╭━━━〔 ${tagsMapping[tag]} 〕━━━╮\n`
            let commands = tags[tag]
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
