let handler = async (m, { conn, isOwner }) => {
  let getGroups = await conn.groupFetchAllParticipating()
  let groups = Object.entries(getGroups).slice(0).map(entry => entry[1])
  let ids = groups.map(v => v.id)

  if (ids.length === 0) return m.reply('✿ *معلش، أنا مش في جروبات*')

  await m.reply(`✿ *بسيب ${ids.length} جروب... \n> متوحشونيش (عارف إنكم هتوحشوني).*`)

  for (let id of ids) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) 
      await conn.groupLeave(id)
    } catch (e) {
      console.log(`خطأ في الخروج من: ${id}`)
    }
  }

  await m.reply('✿ *Listo, ya soy libre* 😎')
}

handler.help = ['leaveall']
handler.tags = ['owner']
handler.command = ['salirdetodo', 'leaveall', 'salirdetodos', 'massleave']
handler.owner = true 

export default handler
