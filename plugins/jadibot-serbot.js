import { useMultiFileAuthState } from '@whiskeysockets/baileys'
import { join, basename } from 'path'
import { readdirSync } from 'fs'
import { loadDatabase } from '../lib/database.js'
import { joinChannels } from '../lib/join.js'
import pino from 'pino'
import { makeWASocket, DisconnectReason } from '@whiskeysockets/baileys'
import chalk from 'chalk'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let pathYukiJadiBot = join('./jadibts/', text || '')
  let { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

  let sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Shizuka-AI SubBot', 'Safari', '1.0.0'],
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      if (!global.db.data?.users) loadDatabase()

      let userName = sock.authState.creds.me.name || 'Anónimo'
      let userJid = sock.authState.creds.me.jid || `${basename(pathYukiJadiBot)}@s.whatsapp.net`

      console.log(chalk.bold.cyanBright(`
❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒
│
│ 🟢 ${userName} (+${basename(pathYukiJadiBot)}) conectado exitosamente.
│
❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))

      sock.isInit = true
      global.conns.push(sock)
      await joinChannels(sock)

      // Enviar mensaje decorado al chat donde se activó el subbot
      if (m?.chat) {
        await conn.sendMessage(m.chat, {
          text: 
`╭╼━━━━━❀•༶  
│ 💖 𝙎𝙝𝙞𝙯𝙪𝙠𝙖-𝘼𝙄 𝙄𝙣𝙛𝙤
│
│ 🎉 ¡Sub-Bot conectado exitosamente!
│ 👤 Usuario: *${userName}*
│ ☎️ Número: +${basename(pathYukiJadiBot)}
│ 🌐 Estado: *Conectado y listo*
│
╰╼━━━━━❀•༶`,
          mentions: [m.sender]
        }, { quoted: m }).catch(console.error)
      }

      // Enviar mensaje privado a los dueños
      try {
        let ownerNumbers = global.owner
          .map(o => Array.isArray(o) ? o[0] : o)
          .filter(n => n && n.length > 5)

        for (let number of ownerNumbers) {
          let jid = number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
          await conn.sendMessage(jid, {
            text: 
`╭─❖ 𝙎𝙝𝙞𝙯𝙪𝙠𝙖-𝘼𝙄 | 𝙎𝙪𝙗-𝘽𝙤𝙩 𝘾𝙤𝙣𝙚𝙘𝙩𝙖𝙙𝙤 ❖─╮

🌸 *Nuevo Sub-Bot Activado!*

👤 *Usuario:* ${userName}
📱 *Número:* +${basename(pathYukiJadiBot)}
📶 *Estado:* Conectado
🧠 *Modo:* Sub-Bot Temporal

🔔 Este Sub-Bot está listo para recibir mensajes.

╰──────────────────────────────╯`
          })
        }
      } catch (e) {
        console.log(chalk.red('[❌ Error al enviar mensaje al Owner]:', e))
      }
    }

    if (connection === 'close') {
      let reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.red('❌ Subbot desconectado inesperadamente. Intentando reconectar...'))
        handler(m, { conn, text, usedPrefix, command })
      } else {
        console.log(chalk.red('🔴 Subbot cerrado sesión.'))
      }
    }
  })
}

handler.command = /^(serbot|jadibot)$/i
export default handler