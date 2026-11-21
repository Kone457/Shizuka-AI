let handler = async (m, { conn, usedPrefix, command, isOwner }) => {
  if (!isOwner) return m.reply("✿ الأمر ده للمطور بس.")
  let user = global.db.data.users[m.sender]
  user.coin = user.coin || 0
  let cantidad = 10000000000000000
  user.coin += cantidad
  return conn.reply(m.chat, `✿ Has *recibido*  *${cantidad.toLocaleString()} Coins*.`, m)
}

handler.help = ['غش']
handler.tags = ['owner']
handler.command = ['chetar', 'غش']
handler.owner = true

export default handler