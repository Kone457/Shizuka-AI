import { getMentionTarget } from '../lib/groupuser.js'
let handler = async (m, { conn, participants }) => {
    let user = getMentionTarget(m, participants) || m.sender
    let users = global.db.data.users
    if (!users[user]) users[user] = {}
    users[user].warn = users[user].warn || 0
    await conn.reply(m.chat, `📋 Advertencias de @${user.split('@')[0]}

> ✦ Total: *${users[user].warn}*`, m, { mentions: [user] })
}
handler.help = ['warnings']
handler.tags = ['grupo']
handler.command = ['warnings']
handler.group = true
export default handler
