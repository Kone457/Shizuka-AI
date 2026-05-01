var handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `《✧》 Escribe el título y las opciones separadas por |.\nEjemplo: ${usedPrefix}poll ¿Cuál es tu anime favorito? | Naruto | One Piece | Bleach`, m)

  let [title, ...options] = text.split('|').map(v => v.trim())

  if (!title || options.length < 2) {
    return conn.reply(m.chat, `《✧》 Debes escribir un título y al menos 2 opciones.`, m)
  }

  await conn.sendMessage(m.chat, {
    poll: {
      name: title,
      values: options,
      selectableCount: 1
    }
  })

  await conn.reply(m.chat, `✦ Encuesta creada:\n> ${title}`, m)
}

handler.help = ['poll']
handler.tags = ['grupo']
handler.command = ['poll']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler