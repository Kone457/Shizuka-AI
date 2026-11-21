import { getMentionTarget } from '../lib/groupuser.js'
let handler = async (m, { conn, participants }) => {
    let user = getMentionTarget(m, participants)
    if (!user) return conn.reply(m.chat, '《✧》لازم تعمل منشن أو ترد على المستخدم.', m)
    let users = global.db.data.users
    if (!users[user]) users[user] = {}
    users[user].warn = users[user].warn || 0
    if (users[user].warn <= 0) return conn.reply(m.chat, '❏ المستخدم ده معندوش إنذارات.', m)
    users[user].warn--
    await conn.reply(m.chat, `✅ اتشال إنذار من @${user.split('@')[0]}\n> ✦ الإنذارات الحالية: *${users[user].warn}*`, m, { mentions: [user] })
}
handler.help = ['unwarn']
handler.tags = ['grupo']
handler.command = ['unwarn']
handler.group = true
handler.admin = true
export default handler
