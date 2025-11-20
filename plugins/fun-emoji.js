let handler = async (m, { conn }) => {
  
  if (m.text === '❗') {
    await conn.reply(
      m.chat, 
      `😏👉 ¿Qué pasa zorra???`, 
      m
    )
  }
}

handler.customPrefix = /^❗$/i
handler.command = new RegExp  
handler.tags = ['fun']

export default handler