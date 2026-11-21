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

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
    } catch (error) {
        throw new Error('❏ مقدرتش أحفظ ملف characters.json.')
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

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2))
    } catch (error) {
        throw new Error('❏ مقدرتش أحفظ ملف harem.json.')
    }
}

let handler = async (m, { conn, args }) => {
    const userId = m.sender

    if (args.length < 2) {
        await conn.reply(m.chat, '《✧》لازم تحدد اسم الشخصية وتعمل منشن للي عايز تهديها له.', m)
        return
    }

    const characterName = args.slice(0, -1).join(' ').toLowerCase().trim()
    let who = m.mentionedJid[0]

    if (!who) {
        await conn.reply(m.chat, '《✧》لازم تعمل منشن لمستخدم صحيح.', m)
        return
    }

    try {
        const characters = await loadCharacters()
        const character = characters.find(c => c.name.toLowerCase() === characterName && c.user === userId)

        if (!character) {
            await conn.reply(m.chat, `《✧》*${characterName}* مش بتاعتك.`, m)
            return
        }

        character.user = who
        await saveCharacters(characters)

        const harem = await loadHarem()
        const userEntryIndex = harem.findIndex(entry => entry.userId === who)

        if (userEntryIndex !== -1) {
            harem[userEntryIndex].characterId = character.id
            harem[userEntryIndex].lastClaimTime = Date.now()
        } else {
            const userEntry = {
                userId: who,
                characterId: character.id,
                lastClaimTime: Date.now()
            }
            harem.push(userEntry)
        }

        await saveHarem(harem)

        await conn.reply(m.chat, `✰ *${character.name}* ha sido regalado a @${who.split('@')[0]}!`, m, { mentions: [who] })
    } catch (error) {
        await conn.reply(m.chat, `✘ خطأ في إهداء الشخصية: ${error.message}`, m)
    }
}

handler.help = ['regalar']
handler.tags = ['gacha']
handler.command = ['regalar', 'givewaifu', 'givechar']
handler.group = true
handler.gacha = true

export default handler
