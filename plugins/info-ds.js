import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    if (global.conn.user.jid !== conn.user.jid) {
        return conn.reply(m.chat, `✿ *Este comando solo puede usarse desde el número principal.*`, m)
    }

    let chatId = m.isGroup ? [m.chat, m.sender] : [m.sender]
    let sessionPath = `./${sessions}/`
    let filesDeleted = 0

    try {
        let files = await fs.readdir(sessionPath)

        for (let file of files) {
            for (let id of chatId) {
                if (file.includes(id.split('@')[0])) {
                    await fs.unlink(path.join(sessionPath, file))
                    filesDeleted++
                    break
                }
            }
        }

        if (filesDeleted === 0) {
            await conn.reply(m.chat, `✿ *No se ha encontrado ningún archivo de sesión relacionado con este chat.*`, m)
        } else {
            await conn.reply(m.chat, `✿ Se han eliminado con éxito ${filesDeleted} fragmentos de sesión.*`, m)
            await conn.reply(m.chat, `✿ *Hola de nuevo... ¿me ves ahora?*`, m)
        }

    } catch (err) {
        console.error('❏ Error en la limpieza de sesión:', err)
        await conn.reply(m.chat, `Error en la limpieza de sesión`, m)
    }
}

handler.help = ['ds']
handler.tags = ['info']
handler.command = ['fixmsgespera', 'ds']
handler.owner = true

export default handler