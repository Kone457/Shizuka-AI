import { getMentionTarget } from '../lib/groupuser.js'
let handler = async (m, { conn, participants }) => {
    let user = getMentionTarget(m, participants)
    if (!user) return conn.reply(m.chat, '《✧》لازم تعمل منشن أو ترد على المستخدم.', m)
    let data = global.db.data.users[user]
    if (!data?.warnHistory?.length) return conn.reply(m.chat, '❏ مفيش سجل إنذارات.', m)
    let txt = `📋 سجل @${user.split('@')[0]}\n\n`
    for (let w of data.warnHistory) {
        txt += `➥ Moderador: @${w.by.split('@')[0]}
`
        txt += `➥ Fecha: ${w.date}
`
        txt += `➥ السبب: ${w.reason}\n\n`
    }
    await conn.reply(m.chat, txt.trim(), m, { mentions: [user, ...data.warnHistory.map(v => v.by)] })
}
handler.help = ['سجل الانذارات']
handler.tags = ['grupo']
handler.command = ['warnhistory', 'سجلالانذارات', 'سجل الانذارات', 'سجل_الانذارات']
handler.group = true
handler.admin = true
export default handler
