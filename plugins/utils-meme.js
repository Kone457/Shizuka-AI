import pkg from 'hispamemes'
const { meme } = pkg

let handler = async (m, { conn }) => {
  try {
    const memeUrl = meme()

    if (!memeUrl) throw new Error("مقدرتش أجيب المحتوى المطلوب.")

    await conn.sendMessage(
      m.chat,
      { image: { url: memeUrl } },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '🤣', key: m.key } })
    await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } })

  } catch (error) {
    console.error('❌ خطأ في تنفيذ الميم:', error)
    await conn.sendMessage(
      m.chat,
      {
        text: `⚠️ حصل خطأ في تنفيذ الأمر.\nالتفاصيل: ${error.message}`,
        quoted: m
      }
    )
  }
}

handler.help = ['ميمز']
handler.tags = ['tools']
handler.command = ['meme', 'hispameme', 'ميمز', 'ميم']
handler.group = false

export default handler