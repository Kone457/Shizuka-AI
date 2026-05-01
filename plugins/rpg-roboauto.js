let handler = async (m, { conn, usedPrefix, command }) => {
  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return m.reply(`《✦》Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *${usedPrefix}on economy*`)
  }
  let user = global.db.data.users[m.sender]
  user.lastroboauto = user.lastroboauto || 0
  const cooldown = 6 * 60 * 1000
  if (Date.now() < user.lastroboauto) {
    const restante = user.lastroboauto - Date.now()
    return conn.reply(m.chat, `✿ Debes esperar *${formatTime(restante)}* para usar *${usedPrefix + command}* de nuevo.`, m)
  }
  user.lastroboauto = Date.now() + cooldown
  const evento = pickRandom(roboauto)
  let cantidad = Math.floor(Math.random() * 2000) + 3000
  if (evento.tipo === 'victoria') {
    user.coin += cantidad
  } else {
    user.coin -= cantidad
    if (user.coin < 0) user.coin = 0
  }
  return conn.reply(m.chat, `✿ ${evento.mensaje} *${cantidad.toLocaleString()} monedas*`, m)
}

handler.help = ['roboauto']
handler.tags = ['rpg']
handler.command = ['roboauto']
handler.group = true

export default handler

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m ${sec}s`
}
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const roboauto = [
  { tipo: 'victoria', mensaje: "Forzaste la cerradura de un coche de lujo y escapaste, ganaste." },
  { tipo: 'victoria', mensaje: "Hackeaste el sistema de un Tesla y lo revendiste, ganaste." },
  { tipo: 'derrota', mensaje: "El dueño salió justo a tiempo y te atrapó, perdiste." },
  { tipo: 'derrota', mensaje: "La policía rastreó el GPS del auto y te detuvo, perdiste." }
]