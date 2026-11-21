let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `《✧》 مثال للاستخدام:\n.inspect https://whatsapp.com/channel/1234`,
        m
      )
    }

    if (text.includes('https://whatsapp.com/channel/')) {
      let i = await getInfo(conn, text)

      await m.reply(i.id)

      await conn.sendMessage(m.chat, { react: { text: "☑️", key: m.key } })
    } else {
      return conn.reply(m.chat, `《✧》 اكتب لينك صحيح.`, m)
    }
  } catch (error) {
    console.error(error)
    await conn.reply(
      m.chat,
      `❏ خطأ في جلب معلومات القناة:\n> ${error.message}`,
      m
    )
  }
}

handler.command = ['inspector', 'inspect', 'id', 'مفتش', 'فحص', 'ايدي']
handler.help = ['فحص']
handler.tags = ['tools']
handler.owner = false

export default handler

async function getInfo(conn, url) {
  const match = url.match(/https:\/\/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)
  if (!match)
    throw new Error(
      '❏ اللينك ده مش صحيح أو مش تبع قناة واتساب.'
    )

  const channelId = match[1]

  try {
    const info = await conn.newsletterMetadata('invite', channelId)
    return { id: info.id } 
  } catch (error) {
    throw new Error(`❏ مقدرتش أجيب معلومات القناة: ${error.message}`)
  }
}