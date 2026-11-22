import { resolveGroupUser, normalizeNum } from '../lib/groupuser.js'
let handler = async (m, { conn, args }) => {
  try {
    const id = args?.[0]?.match(/\d+\-\d+@g.us/)?.[0] || m.chat
    const metadata = await conn.groupMetadata(id)
    const admins = metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)
      .map(p => normalizeNum(resolveGroupUser(metadata.participants, p.id || p.jid || p.lid || p.phoneNumber)))
    const mensajes = Object.values(conn.chats?.[id]?.messages || {})
    const participantesUnicos = mensajes
      .map(msg => msg?.key?.participant)
      .filter((v, i, a) => v && a.findIndex(x => normalizeNum(x) === normalizeNum(v)) === i)
    const participantesOrdenados = participantesUnicos
      .filter(p => metadata.participants.some(q => normalizeNum(resolveGroupUser(metadata.participants, q.id || q.jid || q.lid || q.phoneNumber)) === normalizeNum(p)))
      .map(p => resolveGroupUser(metadata.participants, p))
      .filter(Boolean)
      .sort((a, b) => {
        const isAdminA = admins.includes(normalizeNum(a))
        const isAdminB = admins.includes(normalizeNum(b))
        if (isAdminA && !isAdminB) return -1
        if (!isAdminA && isAdminB) return 1
        return a.localeCompare(b)
      })
    const adminsList = participantesOrdenados
      .filter(p => admins.includes(normalizeNum(p)))
      .map(p => `✰ *@${p.split("@")[0]}* (مشرف)`)
    const usersList = participantesOrdenados
      .filter(p => !admins.includes(normalizeNum(p)))
      .map(p => `❖ *@${p.split("@")[0]}*`)
    const resultado = [
      "✿ مسح الحضور في الجروب*\n",
      adminsList.length ? `✰ *Administradores activos:*\n${adminsList.join("\n")}\n` : "",
      usersList.length ? `✿ *الأعضاء النشطين:*\n${usersList.join("\n")}` : "✧ مفيش مستخدمين تانيين أونلاين.",
      "\n✿ _البيانات اتظبطت بدقة._"
    ].join("\n")
    await conn.sendMessage(m.chat, { text: resultado, contextInfo: { mentionedJid: participantesOrdenados } }, { quoted: m })
    if (m.react) await m.react("👻")
  } catch (error) {
    console.error(error)
    await m.reply(`❏ *حصل خطأ أثناء المسح.*\n\n✰ تفاصيل تقنية: ${error.message}\n\n> ❖ اتأكد إن الجروب شغّال وفيه رسائل حديثة وإن عندي صلاحيات كاملة.`)
  }
}
handler.help = ['المتصلين']
handler.tags = ["grupo"]
handler.command = ['listonline', 'online', 'linea', 'enlinea', 'المتصلين', 'اونلاين']
handler.group = true
export default handler
