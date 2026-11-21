import { getBotConfig } from '../lib/botconfig.js'

let handler = async (m, { conn, text, command }) => {
  const botname = getBotConfig(conn, 'botname')
  let id = text ? text : m.chat  
  let chat = global.db.data.chats[m.chat]
  
  chat.welcome = false

  await conn.reply(
    id, 
    `✿ *${botname} بيسيب الجروب...*\n> شكراً على اللحظات الحلوة.`, 
    m
  ) 

  await conn.groupLeave(id)

  try {  
    chat.welcome = true
  } catch (e) {
    await m.reply(
      `❏ حصل خطأ`, 
      m
    ) 
    return console.log(e)
  }
}

handler.command = ['salir', 'leavegc', 'salirdelgrupo', 'leave', 'اخرج', 'خروج', 'اطلع', 'غادر']
handler.group = true
handler.owner = true

export default handler