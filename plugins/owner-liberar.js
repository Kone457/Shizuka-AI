import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

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
    try {
        const characters = await loadCharacters()

        const claimedCharacters = characters.filter(c => c.user)

        if (!claimedCharacters.length) {
            return await conn.reply(
                m.chat,
                '❏ مفيش شخصيات مطالب بيها عشان تتحرر.',
                m
            )
        }

        for (const character of claimedCharacters) {
            character.user = null
            character.status = 'Libre'
        }

        await saveCharacters(characters)

        await conn.reply(
            m.chat,
            `✦ اتحرر *${claimedCharacters.length}* شخصية بنجاح.\n\n> دلوقتي كلهم متاحين تاني.`,
            m
        )

    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ خطأ في تحرير الشخصيات: ${error.message}`,
            m
        )
    }
}

handler.help = ['ويفوهات']
handler.tags = ['gacha']
handler.command = ['lwaifus', 'freewaifus', 'ويفوهات', 'متاحين']
handler.group = true
handler.gacha = true
handler.owner = true

export default handler