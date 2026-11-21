let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) return m.reply("✿ رد على رسالة فيها أمر.")
  let texto = m.quoted.text || ""
  if (!texto.startsWith(usedPrefix)) return m.reply("✿ الرسالة المردود عليها مش أمر.")
  let fakeMsg = { ...m, text: texto }
  conn.handler(fakeMsg, fakeMsg)
}

handler.help = ["r"]
handler.tags = ["tools"]
handler.command = ["replay", "r", 'كرر']
handler.group = true

export default handler