let handler = async (m, { conn, text, command }) => {
  let id = text ? text : m.chat  
  let chat = global.db.data.chats[m.chat]
  
  chat.welcome = false

  await conn.reply(
    id, 
    `✿ *${botname} se despide del grupo...*\n> Gracias por los momentos compartidos.`, 
    m
  ) 

  await conn.groupLeave(id)

  try {  
    chat.welcome = true
  } catch (e) {
    await m.reply(
      `❏ Ocurrio un error`, 
      m
    ) 
    return console.log(e)
  }
}

handler.command = ['salir', 'leavegc', 'salirdelgrupo', 'leave']
handler.group = true
handler.owner = true

export default handler