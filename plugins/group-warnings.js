import { getMentionTarget } from '../lib/groupuser.js'
let handler = async (m, { conn, participants }) => {
    let user = getMentionTarget(m, participants) || m.sender
    let users = global.db.data.users
    if (!users[user]) users[user] = {}
    users[user].warn = users[user].warn || 0
    await conn.reply(m.chat, `📋 إنذارات @${user.split('@')[0]}\n\n> ✦ الإجمالي: *${users[user].warn}*`, m, { mentions: [user] })
}
handler.help = ['انذاراتي']
handler.tags = ['grupo']
handler.command = ['warnings', 'انذاراتي']
handler.group = true
export default handler
