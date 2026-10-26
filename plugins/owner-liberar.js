import { promises as fs } from 'fs'

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        throw new Error('❏ No se pudo cargar el archivo characters.json.')
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
        throw new Error('❏ No se pudo guardar el archivo characters.json.')
    }
}

let handler = async (m, { conn }) => {
    try {
        const characters = await loadCharacters()

        const claimedCharacters = characters.filter(c => c.user)

        if (!claimedCharacters.length) {
            return await conn.reply(
                m.chat,
                '❏ No hay personajes reclamados para liberar.',
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
            `✦ Se han liberado *${claimedCharacters.length}* personajes correctamente.\n\n> Ahora todos están disponibles nuevamente.`,
            m
        )

    } catch (error) {
        await conn.reply(
            m.chat,
            `✘ Error al liberar los personajes: ${error.message}`,
            m
        )
    }
}

handler.help = ['lwaifus']
handler.tags = ['gacha']
handler.command = ['lwaifus', 'freewaifus']
handler.group = true
handler.gacha = true
handler.owner = true

export default handler