let handler = async (m, { conn, isOwner }) => {
  let getGroups = await conn.groupFetchAllParticipating()
  let groups = Object.entries(getGroups).slice(0).map(entry => entry[1])
  let ids = groups.map(v => v.id)

  if (ids.length === 0) return m.reply('✿ *Lo siento pero no estoy en grupos*')

  await m.reply(`✿ *Abandonando ${ids.length} grupos... \n> No me extrañen (sé que lo harán).*`)

  for (let id of ids) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) 
      await conn.groupLeave(id)
    } catch (e) {
      console.log(`Error al salir de: ${id}`)
    }
  }

  await m.reply('✿ *Listo, ya soy libre* 😎')
}

handler.help = ['leaveall']
handler.tags = ['owner']
handler.command = ['salirdetodo', 'leaveall', 'salirdetodos', 'massleave']
handler.owner = true 

export default handler
