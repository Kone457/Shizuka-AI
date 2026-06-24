const parseTime = (time, unit) => {
  time = parseInt(time)
  if (isNaN(time)) return 0

  switch (unit) {
    case 's': return time * 1000
    case 'm': return time * 60 * 1000
    case 'h': return time * 60 * 60 * 1000
    case 'd': return time * 24 * 60 * 60 * 1000
    default: return 0
  }
}

let handler = async (m, { conn, command, args }) => {
  try {
    let groupMetadata = await conn.groupMetadata(m.chat)
    let groupAnnouncement = groupMetadata.announce

    let time = args[0]
    let unit = args[1]
    let delayTime = parseTime(time, unit)

    if (command === 'close') {
      if (!time) {
        if (groupAnnouncement === true) {
          return conn.reply(m.chat, `✿ *El grupo ya estaba cerrado.*`, m)
        }
        await conn.groupSettingUpdate(m.chat, 'announcement')
        return conn.reply(m.chat, `✿ *El grupo ha sido cerrado correctamente.*\n> Solo los admins pueden hablar.`, m)
      }

      conn.reply(m.chat, `✿ *El grupo se cerrará en ${time}${unit}*`, m)

      setTimeout(async () => {
        await conn.groupSettingUpdate(m.chat, 'announcement')
        conn.reply(m.chat, `✿ *El grupo ha sido cerrado automáticamente.*`, m)
      }, delayTime)

    } else if (command === 'open') {
      if (!time) {
        if (groupAnnouncement === false) {
          return conn.reply(m.chat, `✿ *El grupo ya estaba abierto.*`, m)
        }
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
        return conn.reply(m.chat, `✿ *El grupo ha sido abierto correctamente.*\n> ¡Todos pueden participar de nuevo! 🙌`, m)
      }

      conn.reply(m.chat, `✿ *El grupo se abrirá en ${time}${unit}*`, m)

      setTimeout(async () => {
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
        conn.reply(m.chat, `✿ *El grupo ha sido abierto automáticamente.*`, m)
      }, delayTime)

    } else {
      return conn.reply(m.chat, `❏ *Comando no reconocido.*`, m)
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❏ *Error:*\n> ${e.message}`, m)
  }
}

handler.help = ['close', 'open']
handler.tags = ['grupo']
handler.command = ['close', 'open']
handler.admin = true
handler.botAdmin = true

export default handler