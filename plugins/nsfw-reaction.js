import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, command }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let jsonPath = path.join(process.cwd(), 'lib', 'reaction.json')
    let reactions;
    
    try {
        reactions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    } catch (e) {
        console.error(e)
        return m.reply('❌ Error al leer el archivo `lib/reaction.json`. Asegúrate de que exista y esté bien estructurado.')
    }

    let cmd = command.toLowerCase()
    let videos = reactions[cmd]
    let texts = reactions[`text-${cmd}`]

    if (!videos || !texts) return m.reply(`❌ No se encontraron datos para la reacción NSFW: ${cmd}`)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `\`${name2}\` ${texts[0]} \`${name || who}\`` 
        : `\`${name2}\` ${texts[1]}`

    if (m.isGroup) {
        let video = videos[Math.floor(Math.random() * videos.length)]
        conn.sendMessage(m.chat, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
            mentions: [who, m.sender] 
        }, { quoted: m })
    }
}

const nsfwCommands = [
    'preg', '69', 'anal', 'blowjob', 'boobjob', 'cum', 'fap', 
    'footjob', 'fuck', 'grabboobs', 'lickpussy', 'spank', 'suckboobs', 
    'undress', 'yuri'
]

handler.help = nsfwCommands
handler.tags = ['nsfw']
handler.command = new RegExp(`^(${nsfwCommands.join('|')})$`, 'i')
handler.group = true
handler.nsfw = true 

export default handler
