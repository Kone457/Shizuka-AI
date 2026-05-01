import pkg from 'hispamemes'
const { hispamemes } = pkg 

let handler = async (m, { conn }) => {
  const processingMsg = await conn.sendMessage(
    m.chat,
    { text: '⏳ Procesando...' },
    { quoted: m }
  )

  try {
    const memeUrl = await hispamemes() 

    if (!memeUrl) throw new Error("No se pudo obtener el contenido solicitado.")

    await conn.sendMessage(
      m.chat,
      { 
        image: { url: memeUrl }, 
        caption: `📌 Aquí tienes.`
      },
      { quoted: m }
    )

    await conn, { delete: processingMsg.key })

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