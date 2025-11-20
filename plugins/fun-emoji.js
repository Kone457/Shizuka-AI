let handler = async (m, { conn }) => {
  // Verificamos si el mensaje contiene exactamente el emoji ❗
  if (m.text === '❗') {
    await conn.reply(
      m.chat, 
      `😏👉 ¿Qué pasa zorra???`, 
      m
    )
  }
}

handler.customPrefix = /^❗$/i
handler.command = new RegExp // no necesita comando, solo el emoji
handler.tags = ['fun']

export default handler