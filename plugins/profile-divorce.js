import { getUser } from '../lib/userdb.js'
let divorciosPendientes = globalThis.divorciosPendientes || (globalThis.divorciosPendientes = {})

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ الأمر ده للجروبات بس.')

  let userJid = m.sender
  let user = getUser(globalThis.db.data.users, userJid) || {}

  if (!user.marry) return m.reply('⚠️ انت مش متجوز حد دلوقتي.')

  divorciosPendientes[userJid] = {
    pareja: user.marry,
    chat: m.chat,
    time: Date.now()
  }

  let parejaName = await conn.getName(user.marry)
  let userName = await conn.getName(userJid)

  await conn.sendMessage(m.chat, {
    text: `📜 ${userName}, على وشك تتطلق من ${parejaName}.\n\nمتأكد؟\nرد بـ:\n• *نعم* للتأكيد\n• *لا* للإلغاء`,
    mentions: [userJid, user.marry]
  }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.text) return

  let userJid = m.sender
  if (!divorciosPendientes[userJid]) return

  let intento = divorciosPendientes[userJid]
  if (intento.chat !== m.chat) return

  let txt = m.text.trim().toLowerCase()

  if (['sí', 'si', 'confirmo', 'نعم', 'أكيد'].includes(txt)) {
    let user = getUser(globalThis.db.data.users, userJid)
    let parejaJid = intento.pareja
    let pareja = getUser(globalThis.db.data.users, parejaJid) || {}

    user.marry = ''
    if (pareja.marry === userJid) pareja.marry = ''

    delete divorciosPendientes[userJid]

    let parejaName = await conn.getName(parejaJid)
    let userName = await conn.getName(userJid)

    await conn.sendMessage(m.chat, {
      text: `💔 الحب خلص! ${userName} و${parejaName} قرروا يتطلقوا رسميًا. 📜🥀`,
      mentions: [userJid, parejaJid]
    }, { quoted: m })
  } else if (['no', 'cancelar', 'لا', 'إلغاء'].includes(txt)) {
    delete divorciosPendientes[userJid]

    await conn.sendMessage(m.chat, {
      text: `✅ الطلاق اتلغى. الحب لسه عايش ❤️`,
      mentions: [userJid, intento.pareja]
    }, { quoted: m })
  }
}

handler.help = ['طلاق']
handler.tags = ['perfil']
handler.command = ['divorciar', 'طلاق']
export default handler