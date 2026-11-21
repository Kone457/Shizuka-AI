
import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

const cooldowns = {}

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        throw new Error('❏ مقدرتش أحمّل ملف characters.json.')
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(
            charactersFilePath,
            JSON.stringify(characters, null, 2),
            'utf-8'
        )
    } catch {
        throw new Error('❏ مقدرتش أحفظ ملف characters.json.')
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
            `《✧》لازم تستنى *${minutes} دقيقة و${seconds} ثانية* عشان تستخدم *#c* تاني.`,
            m
        )
    }

    if (!m.quoted?.text) {
        return await conn.reply(
            m.chat,
            '《✧》لازم ترد على شخصية صحيحة عشان تطالب بيها.',
            m
        )
    }

    try {
        const characters = await loadCharacters()

        const characterIdMatch = m.quoted.text.match(
            /✦ ID(?:\s*»|:)\s*\*(.+?)\*/
        )

        if (!characterIdMatch) {
            return await conn.reply(
                m.chat,
                '《✧》مقدرتش ألاقي ID الشخصية في الرسالة المردود عليها.',
                m
            )
        }

        const characterId = characterIdMatch[1].trim()

        const character = characters.find(
            c => String(c.id) === String(characterId)
        )

        if (!character) {
            return await conn.reply(
                m.chat,
                '《✧》الرسالة المردود عليها مش شخصية صحيحة.',
                m
            )
        }

        if (character.user && character.user !== userId) {
            return await conn.reply(
                m.chat,
                `《✧》الشخصية دي اطالب بيها @${character.user.split('@')[0]}، جرّب المرة الجاية :v.`,
                m,
                { mentions: [character.user] }
            )
        }

        if (character.user === userId) {
            return await conn.reply(
                m.chat,
                `《✧》Ya has reclamado a *${character.name}*.`,
                m
            )
        }

        character.user = userId
        character.status = 'Reclamado'

        await saveCharacters(characters)

        await conn.reply(
            m.chat,
            `✦ طالبت بـ *${character.name}* بنجاح.`,
            m
        )

        cooldowns[userId] = now + 30 * 60 * 1000

    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ خطأ في المطالبة بالشخصية: ${error.message}`,
            m
        )
    }
}

handler.help = ['claim']
handler.tags = ['gacha']
handler.command = ['c', 'claim', 'reclamar']
handler.group = true
handler.gacha = true

export default handler