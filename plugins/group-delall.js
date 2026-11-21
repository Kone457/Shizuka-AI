var handler = async (m, { conn }) => {
  try {
    const msgs = await conn.fetchMessages(m.chat, 100)

    if (!msgs || !msgs.length) {
      return conn.reply(m.chat, `✧ مفيش رسائل حديثة تتحذف.`, m)
    }

    for (let msg of msgs) {
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: msg.key.fromMe,
            id: msg.key.id,
            participant: msg.key.participant || undefined
          }
        })
      } catch (e) {
        console.log(`خطأ في حذف الرسالة:`, e)
      }
    }

    await conn.reply(m.chat, `✦ آخر 100 رسالة في الجروب اتحذفت...`, m)
  } catch (err) {
    console.error(err)
    conn.reply(m.chat, `✧ حصل خطأ وأنا بحاول أحذف الرسائل.`, m)
  }
}

handler.help = ['delall']
handler.tags = ['grupo']
handler.command = ['delall']
handler.admin = true
handler.botAdmin = true

export default handler