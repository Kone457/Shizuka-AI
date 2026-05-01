let handler = async (m, { conn, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *${usedPrefix}on economy*`)
  }
  if (!m.quoted) return m.reply("✿ Debes responder al mensaje del usuario al que quieres donar.")
  let target = m.quoted.sender
  if (!target) return m.reply("✿ No se pudo identificar al usuario al que respondiste.")
  let cantidad = parseInt(args[0])
  if (isNaN(cantidad) || cantidad <= 0) return m.reply("✿ Ingresa una cantidad válida.")
  let user = global.db.data.users[m.sender]
  let receptor = global.db.data.users[target]
  if (!receptor) return m.reply("✿ El usuario no está registrado en la base de datos.")
  if (user.coin < cantidad) return m.reply("✿ No tienes suficientes *Coins* para donar esa cantidad.")
  user.coin -= cantidad
  receptor.coin += cantidad
  conn.reply(m.chat, `✿ Has donado *${cantidad.toLocaleString()} Coins* a @${target.split("@")[0]}`, m, { mentions: [target] })
}

handler.help = ['donar']
handler.tags = ['rpg']
handler.command = ['donar']
handler.group = true

export default handler