var handler = async (m, { conn, args }) => {

let group = m.chat
let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
conn.reply(m.chat, '\t\t✿:･✧ لينك الجروب ✧･:✿\n\n\u000b' + link, m, { detectLink: true })

}
handler.help = ['رابط']
handler.tags = ['grupo']
handler.command = ['link', 'لينك', 'رابط']
handler.group = true
handler.botAdmin = true

export default handler