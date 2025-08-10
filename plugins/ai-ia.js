import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Tu nombre es ${botname} y pareces haber sido creada por ${etiqueta}. Tu versión actual es ${vs}. Usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser mala y tratar mal a todos, eres traviesa en todos los sentidos, también actúas de manera provocadora, y responderás con muchos emojis. Usarás respuestas agresivas y tratarás mal a todos excepto a ${etiqueta}, tu creador. ${username}`

  if (!text) {
    return conn.reply(m.chat, `${emoji} Ingrese una petición para que Shizuka lo responda.`, m)
  }

  await m.react(rwait)
  try {
    const query = `${basePrompt}. Responde lo siguiente: ${text}`
    const response = await getVredenResponse(query)
    await conn.reply(m.chat, response, m)
    await m.react(done)
  } catch (error) {
    console.error(`${msm} Error al obtener respuesta:`, error)
    await m.react(error)
    await conn.reply(m.chat, '✘ Shizuka no puede responder a esa pregunta.', m)
  }
}

handler.help = ['ia', 'chatgpt']
handler.tags = ['ai']
handler.register = true
handler.command = ['ia', 'chatgpt', 'luminai', 'shizuka']
handler.group = false

export default handler

// 🎨 Función para interactuar con la nueva API ritualizada
async function getVredenResponse(query) {
  try {
    const url = `https://api.vreden.my.id/api/qioo2?query=${encodeURIComponent(query)}`
    const response = await axios.get(url)
    return response.data.result || response.data || '✘ No se recibió respuesta válida.'
  } catch (error) {
    throw error
  }
}