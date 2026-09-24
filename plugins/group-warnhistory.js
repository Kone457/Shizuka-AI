import { getMentionTarget } from '../lib/groupuser.js'
let handler = async (m, { conn, participants }) => {
    let user = getMentionTarget(m, participants)
    if (!user) return conn.reply(m.chat, '《✧》 Debes mencionar o responder al usuario.', m)
    let data = global.db.data.users[user]
    if (!data?.warnHistory?.length) return conn.reply(m.chat, '❏ Sin historial de advertencias.', m)
    let txt = `📋 Historial de @${user.split('@')[0]}

`
    for (let w of data.warnHistory) {
        txt += `➥ Moderador: @${w.by.split('@')[0]}
`
        txt += `➥ Fecha: ${w.date}
`
        txt += `➥ Razón: ${w.reason}

`
    }
    await conn.reply(m.chat, txt.trim(), m, { mentions: [user, ...data.warnHistory.map(v => v.by)] })
}
handler.help = ['warnhistory']
handler.tags = ['grupo']
handler.command = ['warnhistory']
handler.group = true
handler.admin = true
export default handler
