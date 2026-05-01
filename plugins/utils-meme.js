import pkg from 'hispamemes'
const { meme } = pkg

let handler = async (m, { conn }) => {
  const processingMsg = await conn.sendMessage(
    m.chat,
    { text: '⏳ Procesando...' },
    { quoted: m }
  )

  try {
    const memeUrl = meme()

    if (!memeUrl) throw new Error("No se pudo obtener el contenido solicitado.")

    await conn.sendMessage(
      m.chat,
      { 
        image: { url: memeUrl }, 
        caption: `📌 ¡Aquí tienes...`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { delete: processingMsg.key })

  } catch (error) {
    console.error('❌ Error ejecutando meme:', error)
    await conn.sendMessage(
      m.chat,
      {
        text: `⚠️ Hubo un error ejecutando el comando.\nDetalle: ${error.message}`,
        edit: processingMsg.key
      }
    )
  }
}

handler.help = ['meme']
handler.tags = ['tools']
handler.command = ['meme', 'hispameme']
handler.group = false

export default handler