
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, command }) => {
    let mentioned = await m.mentionedJid
    let who = mentioned.length > 0
        ? mentioned[0]
        : (m.quoted ? m.quoted.sender : m.sender)

    let isMention = mentioned.length > 0

    let name = await conn.getName(who)
    let name2 = await conn.getName(m.sender)

    let jsonPath = path.join(process.cwd(), 'lib', 'reaction.json')
    let reactions

    try {
        reactions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    } catch (e) {
        console.error(e)
        return m.reply('❌ Error al leer el archivo `lib/reaction.json`. Asegúrate de que exista y esté bien estructurado.')
    }

    const aliasMap = {
        embarazo: 'preg',
        sesenta: '69',
        anal: 'anal',
        mamada: 'blowjob',
        sexooral: 'blowjob',
        bj: 'blowjob',
        pechos: 'boobjob',
        correrse: 'cum',
        masturbar: 'fap',
        pies: 'footjob',
        follar: 'fuck',
        coger: 'fuck',
        agarrar: 'grabboobs',
        lamerpussy: 'lickpussy',
        nalgada: 'spank',
        chupar: 'suckboobs',
        desvestir: 'undress',
        lésbico: 'yuri',
        lesbianas: 'yuri'
    }

    let cmd = command.toLowerCase()
    if (aliasMap[cmd]) cmd = aliasMap[cmd]

    let videos = reactions[cmd]
    let texts = reactions[`text-${cmd}`]

    if (!videos || !texts) {
        return m.reply(`❌ No se encontraron datos para la reacción NSFW: ${cmd}`)
    }

    let str = (isMention || m.quoted)
        ? `\`${name2}\` ${texts[0]} \`${name || who}\``
        : `\`${name2}\` ${texts[1]}`

    let video = videos[Math.floor(Math.random() * videos.length)]

    await conn.sendMessage(
        m.chat,
        {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: (isMention || m.quoted)
                ? [who, m.sender]
                : [m.sender]
        },
        { quoted: m }
    )
}

const nsfwCommands = [
    'preg','69','anal','blowjob','boobjob','cum','fap','footjob','fuck',
    'grabboobs','lickpussy','spank','suckboobs','undress','yuri',
    'embarazo','sesenta','mamada','sexooral','bj','pechos','correrse','masturbar',
    'pies','follar','coger','agarrar','lamerpussy','nalgada','chupar',
    'desvestir','lésbico','lesbianas'
]

handler.help = nsfwCommands
handler.tags = ['nsfw']
handler.command = new RegExp(`^(${nsfwCommands.join('|')})$`, 'i')
handler.group = true
handler.nsfw = true

export default handler