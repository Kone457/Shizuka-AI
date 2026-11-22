var handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `《✧》 اكتب العنوان والاختيارات مفصولة بـ |.\nمثال: ${usedPrefix}poll إيه أنمي المفضل عندك؟ | Naruto | One Piece | Bleach`, m)

  let [title, ...options] = text.split('|').map(v => v.trim())

  if (!title || options.length < 2) {
    return conn.reply(m.chat, `《✧》 لازم تكتب عنوان واختيارين على الأقل.`, m)
  }

  await conn.sendMessage(m.chat, {
    poll: {
      name: title,
      values: options,
      selectableCount: 1
    }
  })
}

handler.help = ['تصويت']
handler.tags = ['grupo']
handler.command = ['poll', 'تصويت']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler