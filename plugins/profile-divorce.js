let divorciosPendientes = globalThis.divorciosPendientes || (globalThis.divorciosPendientes = {})

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

  let userJid = m.sender
  let user = globalThis.db.data.users[userJid] ||= {}

  if (!user.marry) return m.reply('⚠️ Actualmente no estás casado/a con nadie.')

  divorciosPendientes[userJid] = {
    pareja: user.marry,
    chat: m.chat,
    time: Date.now()
  }

  let parejaName = await conn.getName(user.marry)
  let userName = await conn.getName(userJid)

  await conn.sendMessage(m.chat, {
    text: `📜 ${userName}, estás a punto de divorciarte de ${parejaName}.\n\n¿Estás seguro?\nResponde con:\n• *sí* para confirmar\n• *no* para cancelar`,
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

  if (['sí', 'si', 'confirmo'].includes(txt)) {
    let user = globalThis.db.data.users[userJid]
    let parejaJid = intento.pareja
    let pareja = globalThis.db.data.users[parejaJid] || {}

    user.marry = ''
    if (pareja.marry === userJid) pareja.marry = ''

    delete divorciosPendientes[userJid]

    let parejaName = await conn.getName(parejaJid)
    let userName = await conn.getName(userJid)

    await conn.sendMessage(m.chat, {
      text: `💔 ¡Se acabó el amor! ${userName} y ${parejaName} han decidido divorciarse oficialmente. 📜🥀`,
      mentions: [userJid, parejaJid]
    }, { quoted: m })
  } else if (['no', 'cancelar'].includes(txt)) {
    delete divorciosPendientes[userJid]

    await conn.sendMessage(m.chat, {
      text: `✅ El divorcio ha sido cancelado. El amor sigue vivo ❤️`,
      mentions: [userJid, intento.pareja]
    }, { quoted: m })
  }
}

handler.command = ['divorciar']
export default handler