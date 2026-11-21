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
        return m.reply('❌ خطأ في قراءة ملف `lib/reaction.json`. اتأكد إنه موجود ومظبوط.')
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
        pensar: 'think',
        غضب: 'angry',
        حمام: 'bath',
        عض: 'bite',
        به: 'bleh',
        خجل: 'blush',
        ملل: 'bored',
        تصفيق: 'clap',
        قهوة: 'coffee',
        بكاء: 'cry',
        حنان: 'cuddle',
        رقص: 'dance',
        سكر: 'drunk',
        اكل: 'eat',
        كف: 'facepalm',
        فرح: 'happy',
        حضن: 'hug',
        قتل: 'kill',
        بوسة: 'kiss',
        ضحك: 'laugh',
        لحس: 'lick',
        حب: 'love',
        مداعبة: 'pat',
        وخز: 'poke',
        زعل: 'pout',
        لكمة: 'punch',
        جري: 'run',
        حزن: 'sad',
        خوف: 'scared',
        اغراء: 'seduce',
        كسوف: 'shy',
        صفعة: 'slap',
        نوم: 'sleep',
        تدخين: 'smoke',
        تفكير: 'think'
    }

    let cmd = command.toLowerCase()
    if (aliasMap[cmd]) cmd = aliasMap[cmd]

    let videos = reactions[cmd]
    let texts = reactions[`text-${cmd}`]

    if (!videos || !texts) {
        return m.reply(`❌ مفيش بيانات للتفاعل: ${cmd}`)
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

const sfwArabic = [
    'غضب','حمام','عض','به','خجل','ملل','تصفيق','قهوة','بكاء',
    'حنان','رقص','سكر','اكل','كف','فرح','حضن','قتل','بوسة',
    'ضحك','حب','وخز','زعل','لكمة','جري','حزن','خوف',
    'كسوف','صفعة','نوم','تدخين','تفكير'
]

const sfwCommands = [
    'angry','bath','bite','bleh','blush','bored','clap','coffee','cry',
    'cuddle','dance','drunk','eat','facepalm','happy','hug','kill','kiss',
    'laugh','lick','love','pat','poke','pout','punch','run','sad','scared',
    'seduce','shy','slap','sleep','smoke','think',
    ...sfwArabic
]

handler.help = sfwArabic
handler.tags = ['anime']
handler.command = new RegExp(`^(${sfwCommands.join('|')})$`, 'i')
handler.group = true

export default handler