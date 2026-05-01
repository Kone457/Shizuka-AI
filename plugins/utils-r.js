let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) return m.reply("✿ Responde a un mensaje que contenga un comando.")
  let texto = m.quoted.text || ""
  if (!texto.startsWith(usedPrefix)) return m.reply("✿ El mensaje citado no parece ser un comando.")
  let partes = texto.trim().split(/\s+/)
  let cmd = partes[0].slice(usedPrefix.length).toLowerCase()
  let args = partes.slice(1)
  let fakeMsg = { ...m, text: args.join(" "), command: cmd }
  conn.handler(fakeMsg, fakeMsg)
}

handler.help = ["r"]
handler.tags = ["tools"]
handler.command = ["replay", "r"]
handler.group = true

export default handler