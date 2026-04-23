let handler = async (m, { conn }) => {

  let q = m.quoted ? m.quoted : m
  
  let isSticker = q.mtype === 'stickerMessage' || (q.mimetype || '').includes('webp')

  if (!isSticker) {
    return m.reply('✿ Responde a un sticker para convertirlo en imagen.')
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })

    let media = await q.download()

    await conn.sendMessage(
      m.chat,
      {
        image: media,
        caption: '✿ Sticker convertido a imagen'
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    m.reply('✿ No pude convertir el sticker.')
  }

}

handler.help = ['toimg']
handler.tags = ['tools']
handler.command = ['toimg','stickerimg','simg']

export default handler
