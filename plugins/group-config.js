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

    if (['close', 'قفل'].includes(command)) {
      if (!time) {
        if (groupAnnouncement === true) {
          return conn.reply(m.chat, `✿ *الجروب مقفول بالفعل.*`, m)
        }
        await conn.groupSettingUpdate(m.chat, 'announcement')
        return conn.reply(m.chat, `✿ *الجروب اتقفل بنجاح.*\n> المشرفين بس اللي يقدروا يتكلموا.`, m)
      }

      conn.reply(m.chat, `✿ *الجروب هيتقفل بعد ${time}${unit}*`, m)

      setTimeout(async () => {
        await conn.groupSettingUpdate(m.chat, 'announcement')
        conn.reply(m.chat, `✿ *الجروب اتقفل تلقائيًا.*`, m)
      }, delayTime)

    } else if (['open', 'فتح'].includes(command)) {
      if (!time) {
        if (groupAnnouncement === false) {
          return conn.reply(m.chat, `✿ *الجروب مفتوح بالفعل.*`, m)
        }
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
        return conn.reply(m.chat, `✿ *الجروب اتفتح بنجاح.*\n> الكل يقدر يشارك تاني! 🙌`, m)
      }

      conn.reply(m.chat, `✿ *الجروب هيتفتح بعد ${time}${unit}*`, m)

      setTimeout(async () => {
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
        conn.reply(m.chat, `✿ *الجروب اتفتح تلقائيًا.*`, m)
      }, delayTime)

    } else {
      return conn.reply(m.chat, `❏ *أمر غير معروف.*`, m)
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❏ *خطأ:*\n> ${e.message}`, m)
  }
}

handler.help = ['قفل', 'فتح']
handler.tags = ['grupo']
handler.command = ['close', 'open', 'قفل', 'فتح']
handler.admin = true
handler.botAdmin = true

export default handler