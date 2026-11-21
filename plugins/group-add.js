var handler = async (m, { conn, text }) => {
  const mentioned = Array.isArray(m.mentionedJid) ? m.mentionedJid : []
  let target = mentioned[0] || (m.quoted?.sender ?? null)
  if (!target && text) {
    const digits = String(text).replace(/[^0-9]/g, '')
    if (digits.length >= 8) target = `${digits}@s.whatsapp.net`
  }
  if (!target) {
    return conn.reply(
      m.chat,
      `《✧》 *اكتب رقم المستخدم أو اعمل منشن.*\n> مثال: .ضيف 201012345678`,
      m
    )
  }
  if (!target.includes('@')) target = `${target}@s.whatsapp.net`

  const num = target.split('@')[0]
  const messages = {
    '200': `✅ *تم إضافة* @${num} *للجروب.*`,
    '403': `📨 *بعته دعوة* — الرقم ${num} بيخفي إعداداته.`,
    '408': `📨 *بعت دعوة لـ* ${num} *عشان ينضم.*`,
    '409': `ℹ️ ${num} *موجود في الجروب أصلاً.*`,
    '500': `❌ *مقدرتش أضيف* ${num} — تأكد إن البوت أدمن والرقم صح.`
  }

  try {
    const res = await conn.groupParticipantsUpdate(m.chat, [target], 'add')
    const status = String(res?.[0]?.status || '')
    await conn.sendMessage(
      m.chat,
      { text: messages[status] || `⚠️ رد غير متوقع من واتساب: ${status || '؟'}`, mentions: [target] },
      { quoted: m }
    )
  } catch (e) {
    await conn.reply(m.chat, `❌ فشلت الإضافة: ${e.message}`, m)
  }
}

handler.help = ['ضيف']
handler.tags = ['grupo']
handler.command = ['add', 'ضيف', 'اضف']
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler
