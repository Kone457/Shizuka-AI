import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  run: async (client, m) => {
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSetting = global.db.data.settings[botId] || {}
    const botname = botSetting.namebot || 'Yotsuba'
    const botname2 = botSetting.namebot2 || 'Bot'
    const banner = botSetting.icon
    const from = m.key.remoteJid

    const groupMetadata = m.isGroup ? await client.groupMetadata(from).catch(() => null) : null
    const groupParticipants = groupMetadata?.participants?.map(p => p.id) || []

    const mainBotJid = global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    const basePath = path.join(dirname, '../../Sessions/Subs')

    const getSubs = () => {
      if (!fs.existsSync(basePath)) return []
      return fs.readdirSync(basePath).filter(dir => {
        return fs.existsSync(path.join(basePath, dir, 'creds.json'))
      }).map(id => id.split('@')[0].replace(/\D/g, '') + '@s.whatsapp.net')
    }

    const allSubs = getSubs()
    const maxSubs = 20
    const mentionedJid = []
    let botList = []

    const formatBot = (jid, type, index, total) => {
      const num = jid.split('@')[0]
      const data = global.db.data.settings[jid] || {}
      const name = data.namebot2 || (type === 'Owner' ? 'Central' : 'Sub-Bot')
      
      const isInGroup = groupParticipants.includes(jid)
      const statusIcon = isInGroup ? '🟢' : '⚪' 
      
      if (isInGroup) mentionedJid.push(jid)

      
      const isLast = index === total - 1
      const branch = isLast ? '┗' : '┣'

      return `${branch}──『 ${statusIcon} 』 @${num}\n${isLast ? ' ' : '┃'}      ◈ *Tag:* ${name}\n${isLast ? ' ' : '┃'}      ◈ *Tipo:* ${type}`
    }

    
    const fullListJids = [mainBotJid, ...allSubs.filter(j => j !== mainBotJid)]
    fullListJids.forEach((jid, i) => {
      const type = jid === mainBotJid ? 'Owner' : 'Sub-Socket'
      botList.push(formatBot(jid, type, i, fullListJids.length))
    })


    let message = `╔════════════════════╗\n`
    message += `║   ✨ *SISTEMA DE SOCKETS* ║\n`
    message += `╚════════════════════╝\n\n`
    
    message += `╔▣ **ESTADÍSTICAS**\n`
    message += `┃ ◈ Totales: ${botList.length}\n`
    message += `┃ ◈ Libres: ${Math.max(0, maxSubs - allSubs.length)}\n`
    message += `┃ ◈ En grupo: ${mentionedJid.length}\n`
    message += `╚════════════════════\n\n`

    message += `╔▣ *REGISTRO DE CONEXIONES*\n`
    message += botList.join('\n') + `\n`
    message += `╚════════════════════\n\n`
    
    message += `> 💡 *Simbología:* 🟢 En línea aquí | ⚪ Remoto`

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
