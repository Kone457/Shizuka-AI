import { getMentionTarget } from '../lib/groupuser.js'
let handler = async (m, { conn, participants }) => {
    let user = getMentionTarget(m, participants)
    if (!user) return conn.reply(m.chat, '《✧》لازم تعمل منشن أو ترد على المستخدم.', m)
    let users = global.db.data.users
    if (!users[user]) users[user] = {}
    users[user].warn = 0
    users[user].warnHistory = []
    conn.reply(m.chat, `✅ كل إنذارات @${user.split('@')[0]} اتشالت.`, m, { mentions: [user] })
}
handler.help = ['clearwarns']
handler.tags = ['grupo']
handler.command = ['clearwarns']
handler.group = true
handler.admin = true
export default handler
