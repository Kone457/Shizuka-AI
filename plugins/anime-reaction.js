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
        enojado: 'angry',
        baño: 'bath',
        morder: 'bite',
        bleh: 'bleh',
        sonrojar: 'blush',
        aburrido: 'bored',
        aplauso: 'clap',
        café: 'coffee',
        llorar: 'cry',
        acurrucar: 'cuddle',
        bailar: 'dance',
        borracho: 'drunk',
        comer: 'eat',
        facepalm: 'facepalm',
        feliz: 'happy',
        abrazo: 'hug',
        matar: 'kill',
        beso: 'kiss',
        besar: 'kiss',
        reír: 'laugh',
        lamer: 'lick',
        amor: 'love',
        acariciar: 'pat',
        poke: 'poke',
        puchero: 'pout',
        golpear: 'punch',
        correr: 'run',
        triste: 'sad',
        asustado: 'scared',
        seducir: 'seduce',
        tímido: 'shy',
        bofetada: 'slap',
        dormir: 'sleep',
        fumar: 'smoke',
        pensar: 'think'
    }

    let cmd = command.toLowerCase()
    if (aliasMap[cmd]) cmd = aliasMap[cmd]

    let videos = reactions[cmd]
    let texts = reactions[`text-${cmd}`]

    if (!videos || !texts) {
        return m.reply(`❌ No se encontraron datos para la reacción: ${cmd}`)
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

const sfwCommands = [
    'angry','bath','bite','bleh','blush','bored','clap','coffee','cry',
    'cuddle','dance','drunk','eat','facepalm','happy','hug','kill','kiss',
    'laugh','lick','love','pat','poke','pout','punch','run','sad','scared',
    'seduce','shy','slap','sleep','smoke','think'
]

const allAliases = [
    'enojado','baño','morder','bleh','sonrojar','aburrido','aplauso','café',
    'llorar','acurrucar','bailar','borracho','comer','facepalm','feliz','abrazo',
    'matar','beso','besar','reír','lamer','amor','acariciar','poke','puchero',
    'golpear','correr','triste','asustado','seducir','tímido','bofetada','dormir',
    'fumar','pensar'
]

handler.help = sfwCommands
handler.tags = ['anime']
handler.command = new RegExp(`^(${[...sfwCommands, ...allAliases].join('|')})$`, 'i')
handler.group = true

export default handler