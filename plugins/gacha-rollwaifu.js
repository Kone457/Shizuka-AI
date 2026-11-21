import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

const cooldowns = {}

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('❏ مقدرتش أحمّل ملف characters.json.')
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender
    const now = Date.now()

    if (cooldowns[userId] && now < cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60

        return await conn.reply(
            m.chat,
            `《✧》لازم تستنى *${minutes} دقيقة و${seconds} ثانية* عشان تستخدم *#rw* تاني.`,
            m
        )
    }

    try {
        const characters = await loadCharacters()

        const freeCharacters = characters.filter(character => !character.user)

        if (!freeCharacters.length) {
            return await conn.reply(
                m.chat,
                '❏ مفيش شخصيات متاحة دلوقتي.',
                m
            )
        }

        const randomCharacter =
            freeCharacters[Math.floor(Math.random() * freeCharacters.length)]

        const randomImage =
            randomCharacter.img[
                Math.floor(Math.random() * randomCharacter.img.length)
            ]

        const message = `
✿ الاسم » *${randomCharacter.name}*
⚥ النوع » *${randomCharacter.gender}*
✰ القيمة » *${randomCharacter.value}*
♡ Estado » *Libre*
❖ Fuente » *${randomCharacter.source}*
✦ ID » *${randomCharacter.id}*
`.trim()

        await conn.sendFile(
            m.chat,
            randomImage,
            `${randomCharacter.name}.jpg`,
            message,
            m
        )

        cooldowns[userId] = now + 15 * 60 * 1000

    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ خطأ في تحميل الشخصية: ${error.message}`,
            m
        )
    }
}

handler.help = ['rw', 'رول']
handler.tags = ['gacha']
handler.command = ['rw', 'rollwaifu', 'رول']
handler.group = true
handler.gacha = true

export default handler