import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'
const haremFilePath = './lib/harem.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('❏ مقدرتش أحمّل ملف characters.json.')
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        return []
    }
}

let handler = async (m, { conn, args }) => {
    if (args.length === 0) {
        await conn.reply(m.chat, `《✧》من فضلك اكتب اسم الشخصية.`, m)
        return
    }

    const characterName = args.join(' ').toLowerCase().trim()

    try {
        const characters = await loadCharacters()
        const character = characters.find(c => c.name.toLowerCase() === characterName)

        if (!character) {
            await conn.reply(m.chat, `《✧》مقدرتش ألاقي الشخصية *${characterName}*. اتأكد إن الاسم صح.`, m)
            return
        }

        const randomImage = character.img[Math.floor(Math.random() * character.img.length)]

        const message = `❀ الاسم » *${character.name}*
⚥ النوع » *${character.gender}*
❖ المصدر » *${character.source}*`

        await conn.sendFile(m.chat, randomImage, `${character.name}.jpg`, message, m)
    } catch (error) {
        await conn.reply(m.chat, `✘ خطأ في تحميل صورة الشخصية: ${error.message}`, m)
    }
}

handler.help = ['wimage']
handler.tags = ['gacha']
handler.command = ['charimage', 'wimage', 'waifuimage']
handler.group = true
handler.gacha = true

export default handler