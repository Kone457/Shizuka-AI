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
    try {
        const characters = await loadCharacters()
        const harem = await loadHarem()
        let userId

        if (m.quoted && m.quoted.sender) {
            userId = m.quoted.sender
        } else if (args[0] && args[0].startsWith('@')) {
            userId = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            userId = m.sender
        }

        const userCharacters = characters.filter(character => character.user === userId)

        if (userCharacters.length === 0) {
            await conn.reply(m.chat, '✰ معندكش شخصيات في مجموعتك.', m)
            return
        }

        const page = parseInt(args[1]) || 1
        const charactersPerPage = 50
        const totalCharacters = userCharacters.length
        const totalPages = Math.ceil(totalCharacters / charactersPerPage)
        const startIndex = (page - 1) * charactersPerPage
        const endIndex = Math.min(startIndex + charactersPerPage, totalCharacters)

        if (page < 1 || page > totalPages) {
            await conn.reply(m.chat, `✰ صفحة غير صحيحة. الإجمالي *${totalPages}* صفحة.`, m)
            return
        }

        let message = `✿ Personajes reclamados ✿\n`
        message += `⌦ المستخدم: @${userId.split('@')[0]}\n`
        message += `♡ Personajes: *(${totalCharacters}):*\n\n`

        for (let i = startIndex; i < endIndex; i++) {
            const character = userCharacters[i]
            message += `» *${character.name}* (*${character.value}*)\n`
        }

        message += `\n> ⌦ _صفحة *${page}* من *${totalPages}*_`

        await conn.reply(m.chat, message, m, { mentions: [userId] })
    } catch (error) {
        await conn.reply(m.chat, `✘ خطأ في تحميل المجموعة: ${error.message}`, m)
    }
}

handler.help = ['harem']
handler.tags = ['gacha']
handler.command = ['harem', 'claims', 'waifus']
handler.group = true
handler.gacha = true

export default handler
