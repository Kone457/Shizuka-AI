const handler = async (m, { conn }) => {
  if (m.text?.toLowerCase() === 'xd') {
    await conn.reply(m.chat, 'puta', m)
  }
}

handler.customPrefix = /^xd$/i
handler.command = new RegExp // no usa comando, solo el prefijo
handler.tags = ['fun']
handler.help = ['xd']

export default handler