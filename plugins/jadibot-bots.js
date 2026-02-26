import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  run: async (client, m) => {
    const mainBotJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSetting = global.db.data.settings[mainBotJid] || {}
    const from = m.key.remoteJid

    const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch(() => null) : null
    const groupParticipants = groupMetadata?.participants?.map(p => p.id) || []

    const activeSubs = (global.conns || [])
      .filter(conn => conn.user && conn.userId !== client.user.id.split(':')[0])
      .map(conn => ({
        jid: conn.userId + '@s.whatsapp.net',
        name: conn.user.name || conn.user.verifiedName || 'Sin nombre'
      }))

    const maxSubs = 20
    const mentionedJid = []
    let botList = []

    const formatBot = (jid, type, index, total, subName = null) => {
      const num = jid.split('@')[0]
      const data = global.db.data.settings[jid] || {}
      
      let name = 'Desconocido'
      if (type === 'Owner') {
        name = data.namebot2 || 'Central'
      } else {
        name = subName || data.namebot2 || 'Sub-Bot'
      }
      
      const isInGroup = groupParticipants.includes(jid)
      const statusIcon = isInGroup ? '🟢' : '⚪' 
      
      if (isInGroup) mentionedJid.push(jid)
      
      const isLast = index === total - 1
      const branch = isLast ? '┗' : '┣'

      return `${branch}──『 ${statusIcon} 』 @${num}\n${isLast ? ' ' : '┃'}      ◈ *Tag:* ${name}\n${isLast ? ' ' : '┃'}      ◈ *Tipo:* ${type}`
    }

    const fullList = [
      { jid: mainBotJid, type: 'Owner', name: null },
      ...activeSubs.map(s => ({ jid: s.jid, type: 'Sub-Socket', name: s.name }))
    ]
    
    fullList.forEach((bot, i) => {
      botList.push(formatBot(bot.jid, bot.type, i, fullList.length, bot.name))
    })

    let message = `╔════════════════════╗\n`
    message += `║   ✨ *SISTEMA DE SOCKETS* ║\n`
    message += `╚════════════════════╝\n\n`
    
    message += `╔▣ **ESTADÍSTICAS**\n`
    message += `┃ ◈ Activos: ${fullList.length}\n`
    message += `┃ ◈ Cupos: ${maxSubs - activeSubs.length}\n`
    message += `┃ ◈ En este chat: ${mentionedJid.length}\n`
    message += `╚════════════════════\n\n`

    message += `╔▣ *REGISTRO DE CONEXIONES*\n`
    message += (botList.length > 0 ? botList.join('\n') : '┃ ◈ No hay subbots activos.') + `\n`
    message += `╚════════════════════\n\n`
    
    message += `> 💡 *Simbología:* 🟢 En este grupo | ⚪ Remoto`

    await client.sendContextInfoIndex(
      m.chat,
      message.trim(),
      {},
      m,
      true,
      mentionedJid
    )
  }
}
