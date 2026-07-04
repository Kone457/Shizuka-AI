import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

let handler = async (m, { conn }) => {
    try {
        const characters = await loadCharacters()

        const freeCharacters = characters.filter(c => !c.user)
        const claimedCharacters = characters.filter(c => c.user)

        const message = `
╭━━〔 HAREM INFO 〕━━⬣
┃ ✦ Total » *${characters.length}*
┃ ✦ Libres » *${freeCharacters.length}*
┃ ✦ Reclamados » *${claimedCharacters.length}*
╰━━━━━━━━━━━━━━━━⬣
`.trim()

        await conn.reply(m.chat, message, m)
    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ Error al cargar los datos: ${error.message}`,
            m
        )
    }
}

handler.help = ['waifulibres']
handler.tags = ['gacha']
handler.command = ['waifulibres']
handler.group = true
handler.gacha = true

export default handler