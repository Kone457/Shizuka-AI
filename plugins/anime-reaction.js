import fs from 'fs'

let handler = async (m, { conn, command }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let reactions;
    try {
        reactions = JSON.parse(fs.readFileSync('./lib/reaction.json', 'utf-8'))
    } catch (e) {
        console.error(e)
        return m.reply('❌ Error al leer el archivo `lib/reaction.json`. Asegúrate de que el formato sea correcto.')
    }

    let cmd = command.toLowerCase()
    let videos = reactions[cmd]
    let texts = reactions[`text-${cmd}`]

    if (!videos || !texts) return m.reply(`❌ No se encontraron datos para la reacción: ${cmd}`)

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

const sfwCommands = [
    'angry', 'bath', 'bite', 'bleh', 'blush', 'bored', 'clap', 'coffee', 'cry', 
    'cuddle', 'dance', 'drunk', 'eat', 'facepalm', 'happy', 'hug', 'kill', 'kiss', 
    'laugh', 'lick', 'love', 'pat', 'poke', 'pout', 'punch', 'run', 'sad', 'scared', 
    'seduce', 'shy', 'slap', 'sleep', 'smoke', 'think'
]

handler.help = sfwCommands
handler.tags = ['anime']
handler.command = new RegExp(`^(${sfwCommands.join('|')})$`, 'i')
handler.group = true

export default handler
