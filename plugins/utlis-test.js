const handler = async (m, { conn }) => {
  if (m.text?.toLowerCase() === 'xd') {
    await conn.reply(m.chat, 'puta', m)
  }
}

export default handler