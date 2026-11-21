let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(
        m.chat,
        `《✧》 مثال للاستخدام:\n.ginfo https://chat.whatsapp.com/grupo`,
        m
      )
    }

    if (text.includes('https://chat.whatsapp.com/')) {
      let info = await getGroupInfoFromLink(conn, text)

      let caption = `✎ *معلومات الجروب*\n\n` +
        `️✿ الاسم: ${info.subject}\n` +
        `✰ الوصف: ${info.desc || 'بدون وصف'}\n` +
        `❖ ID: ${info.id}\n`

      if (info.participants) {
        caption += `❖ الأعضاء: ${info.participants.length}\n`
      }

      if (info.picture) {
        await conn.sendMessage(m.chat, { image: { url: info.picture }, caption }, { quoted: m })
      } else {
        await conn.reply(m.chat, caption + `\n❖ الصورة: مش متاحة`, m)
      }

      await conn.sendMessage(m.chat, { react: { text: "☑️", key: m.key } })
    } else {
      return conn.reply(m.chat, `《✧》 اكتب لينك دعوة صحيح.`, m)
    }
  } catch (error) {
    console.error(error)
    await conn.reply(
      m.chat,
      `❏ خطأ في جلب معلومات الجروب:\n> ${error.message}`,
      m
    )
  }
}

handler.command = ['groupinfo', 'ginfo', 'معلوماتالمجموعة', 'معلوماتجروب']
handler.help = ['معلوماتجروب']
handler.tags = ['tools']
handler.owner = true

export default handler

async function getGroupInfoFromLink(conn, url) {
  const match = url.match(/https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]+)/i)
  if (!match)
    throw new Error('《✧》 اللينك ده مش صحيح أو مش تبع جروب واتساب.')

  const inviteCode = match[1]

  try {
    const invite = await conn.groupGetInviteInfo(inviteCode)
    const jid = invite.id

    let metadata, participants
    try {
      metadata = await conn.groupMetadata(jid)
      participants = metadata.participants
    } catch {
      metadata = invite
      participants = null
    }

    const picture = await conn.profilePictureUrl(jid, 'image').catch(() => invite.picture || null)

    return {
      id: metadata.id,
      subject: metadata.subject,
      desc: metadata.desc,
      participants,
      picture
    }
  } catch (error) {
    throw new Error(`❏ مقدرتش أجيب معلومات الجروب: ${error.message}`)
  }
}