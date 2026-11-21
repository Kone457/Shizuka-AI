import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    if (global.conn.user.jid !== conn.user.jid) {
        return conn.reply(m.chat, `✿ *الأمر ده بيتنفذ من الرقم الأساسي بس.*`, m)
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
            await conn.reply(m.chat, `✿ *مفيش أي ملفات جلسة مرتبطة بالشات ده.*`, m)
        } else {
            await conn.reply(m.chat, `✿ تم حذف ${filesDeleted} جزء من الجلسة بنجاح.*`, m)
            await conn.reply(m.chat, `✿ *أهلاً بيك تاني... شايفني دلوقتي؟*`, m)
        }

    } catch (err) {
        console.error('❏ خطأ في تنظيف الجلسة:', err)
        await conn.reply(m.chat, `خطأ في تنظيف الجلسة`, m)
    }
}

handler.help = ['ds']
handler.tags = ['info']
handler.command = ['fixmsgespera', 'ds', 'اصلاح']
handler.owner = true

export default handler