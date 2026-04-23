import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `\`${name2}\` beso a \`${name || who}\` ( ˘ ³˘)♥` 
        : `\`${name2}\` se besó a sí mismo/a ( ˘ ³˘)♥`
    
    if (m.isGroup) {
        let pp = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/c6dcf64474.mp4'
        let pp2 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/cc153bf57a.mp4'
        let pp3 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/81a25e0763.mp4'
        let pp4 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/75ead7d20a.mp4'

        
        const videos = [pp, pp2, pp3, pp4]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['kiss']
handler.tags = ['anime']
handler.command = ['kiss', 'besar']
handler.group = true

export default handler