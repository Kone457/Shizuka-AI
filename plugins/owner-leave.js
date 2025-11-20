let handler = async (m, { conn, text, command }) => {
  let id = text ? text : m.chat  
  let chat = global.db.data.chats[m.chat]
  
  chat.welcome = false

  await conn.reply(
    id, 
    `👋✨ *Shizuka se despide del grupo...*\n> Gracias por los momentos compartidos.\n> La puerta se cierra con elegancia 🌙`, 
    m
  ) 

  await conn.groupLeave(id)

  try {  
    chat.welcome = true
  } catch (e) {
    await m.reply(
      `⚠️🌫️ *Shizuka tropezó en la niebla...*\n> Pero se levantará con más gracia y continuará su viaje 💫`, 
      m
    ) 
    return console.log(e)
  }
}

handler.command = ['salir', 'leavegc', 'salirdelgrupo', 'leave']
handler.group = true
handler.rowner = true

export default handler