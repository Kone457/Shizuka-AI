import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    let mentioned = await m.mentionedJid
    let who = mentioned.length > 0
        ? mentioned[0]
        : (m.quoted ? m.quoted.sender : m.sender)

    let isMention = mentioned.length > 0

    let name = await conn.getName(who)
    let name2 = await conn.getName(m.sender)

    let videos = [
        'https://files.evogb.win/G7J83h.mp4',
        'https://files.evogb.win/H0gJVc.mp4',
        'https://files.evogb.win/V03Lhd.mp4',
        'https://files.evogb.win/njrasw.mp4'
    ]

    let texts = [
        'se suicidó por',
        'se ha suicidado ◑﹏◐'
    ]

    let str

    if ((isMention || m.quoted) && who !== m.sender) {
        str = `\`${name2}\` ${texts[0]} \`${name}\``
    } else {
        str = `\`${name2}\` ${texts[1]}`
    }

    let video = videos[Math.floor(Math.random() * videos.length)]

    await conn.sendMessage(
        m.chat,
        {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: (isMention || m.quoted) && who !== m.sender
                ? [m.sender, who]
                : [m.sender]
        },
        { quoted: m }
    )
}

handler.help = ['suicidar']
handler.tags = ['anime']
handler.command = /^suicidar$/i
handler.group = true

export default handler