import pkg from 'hispamemes'
const { meme } = pkg

let handler = async (m, { conn }) => {
  try {
    const memeUrl = meme()

    if (!memeUrl) throw new Error("No se pudo obtener el contenido solicitado.")

    await conn.sendMessage(
      m.chat,
      { image: { url: memeUrl } },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '🤣', key: m.key } })
    await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })

  } catch (error) {
    console.error('❌ Error ejecutando meme:', error)
    await conn.sendMessage(
      m.chat,
      {
        text: `⚠️ Hubo un error ejecutando el comando.\nDetalle: ${error.message}`,
        quoted: m
      }
    )
  }
}

handler.help = ['meme']
handler.tags = ['tools']
handler.command = ['meme', 'hispameme']
handler.group = false

export default handler