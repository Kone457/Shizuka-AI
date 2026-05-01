import hispamemes from 'hispamemes'

let handler = async (m, { conn }) => {
  const processingMsg = await conn.sendMessage(
    m.chat,
    { text: '⏳ Procesando solicitud, obteniendo contenido...' },
    { quoted: m }
  )

  try {
    const meme = await hispamemes.random()
    const memeUrl = meme.url || meme

    if (!memeUrl) throw new Error("No se pudo obtener el contenido solicitado.")

    await conn.sendMessage(
      m.chat,
      { 
        image: { url: memeUrl }, 
        caption: `📌 Aquí tienes.`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { delete: processingMsg.key })

  } catch (error) {
    console.error(error)
    await conn.sendMessage(
      m.chat,
      {
        text: `⚠️ Ocurrió un error al procesar la solicitud.\nDetalle: ${error.message}`,
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