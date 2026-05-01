let handler = async (m, { conn, usedPrefix, command, isOwner }) => {
  if (!isOwner) return m.reply("✿ Este comando es exclusivo para el *Owner*.")
  let user = global.db.data.users[m.sender]
  user.coin = user.coin || 0
  let cantidad = 1000000000
  user.coin += cantidad
  return conn.reply(m.chat, `✿ Has *recibido*  *${cantidad.toLocaleString()} Coins*.`, m)
}

handler.help = ['chetar']
handler.tags = ['owner']
handler.command = ['chetar']
handler.owner = true

export default handler