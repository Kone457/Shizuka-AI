let handler = async (m, { conn }) => {

  let q = m.quoted ? m.quoted : m
  
  let isSticker = q.mtype === 'stickerMessage' || (q.mimetype || '').includes('webp')

  if (!isSticker) {
    return m.reply('✿ رد على ستيكر عشان تحوله صورة.')
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })

    let media = await q.download()

    await conn.sendMessage(
      m.chat,
      {
        image: media,
        caption: '✿ الستيكر اتحوّل صورة'
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    m.reply('✿ مقدرتش أحوّل الستيكر.')
  }

}

handler.help = ['صورة ستيكر']
handler.tags = ['tools']
handler.command = ['toimg', 'stickerimg', 'simg', 'صورةستيكر', 'ستيكرصورة', 'سيمج', 'صورة ستيكر', 'ستيكر صورة', 'صورة_ستيكر', 'ستيكر_صورة']

export default handler
