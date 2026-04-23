import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import { default as urlRegex } from 'url-regex-safe'

export default async function (m, conn = { user: {} }) {
  const botId = conn.user.jid
  const senderId = typeof m.sender === 'string' ? m.sender.split('@')[0] : null
  const chatId = typeof m.chat === 'string' ? m.chat : null
  const isFromBot = m.sender === conn.user.jid

  if (!senderId || !chatId || isFromBot) return

  if (!m.text) return

  const isCommandPrefix = typeof m.text === 'string' && /^[\/.#+\-!]/.test(m.text.trim())
  if (!isCommandPrefix) return

  const senderName = globalThis.db.data.users[m.sender]
    ? globalThis.db.data.users[m.sender].name
    : await conn.getName(m.sender) || "Desconocido"

  const chatName = await conn.getName(m.chat) || "Chat Privado"

  const messageType = m.mtype?.replace(/message$/i, '')
    ?.replace('audio', m.msg?.ptt ? 'PTT' : 'Audio')
    ?.replace(/^./, v => v.toUpperCase()) || 'Texto'

  const timeString = (m.messageTimestamp
    ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp))
    : new Date).toLocaleTimeString()

  const botType = botId === globalThis.conn.user.jid
    ? 'Principal'
    : 'Sub Bot'

  const filesize = (() => {
    const msg = m.msg || {}
    return msg.vcard?.length ||
      msg.fileLength?.low ||
      msg.fileLength ||
      msg.axolotlSenderKeyDistributionMessage?.length ||
      m.text?.length || 0
  })()

  const sizeUnit = ['', 'K', 'M', 'G', 'T'][Math.floor(Math.log(filesize || 1) / Math.log(1000))]
  const fileSizeDisplay = filesize > 0
    ? `${(filesize / 1000 ** Math.floor(Math.log(filesize) / Math.log(1000))).toFixed(1)}${sizeUnit}B`
    : '0B'

  const userData = globalThis.db.data.chats[m.chat]?.users?.[m.sender] || {}
  console.log(chalk.gray('\n┌────────────────────────────────────'))
  console.log(`${chalk.white('│ Bot:')} ${chalk.cyan(botId.split('@')[0])} → ${chalk.yellow(botType)}`)
  console.log(`${chalk.white('│ Hora:')} ${chalk.green(timeString)}`)
  if (m.messageStubType && m.text) {
    const stubName = WAMessageStubType[m.messageStubType] || `Evento: ${m.messageStubType}`
    console.log(`${chalk.white('│ Evento:')} ${chalk.magenta(stubName)}`)
  }
  console.log(`${chalk.white('│ Usuario:')} ${chalk.blue(senderName)}`)
  console.log(`${chalk.white('│ Chat:')} ${chalk.greenBright(chatName)}`)
  console.log(`${chalk.white('│ Tipo de mensaje:')} ${chalk.cyanBright(messageType)}`)
  console.log(`${chalk.white('│ Tamaño estimado:')} ${chalk.yellow(fileSizeDisplay)}`)
  console.log(`${chalk.white(`│ Comando Usado:`)} ${chalk.gray(m.text.trim().substring(0, 100))}`)
  console.log('└────────────────────────────────────\n')

  if (m.messageStubParameters?.length) {
    const list = await Promise.all(m.messageStubParameters.map(async jid => {
      const decoded = conn.decodeJid(jid)
      const name = await conn.getName(decoded) || "Desconocido"
      const phone = PhoneNumber('+' + decoded.replace('@s.whatsapp.net', '')).getNumber('international')
      return chalk.gray(`${phone}${name ? ' ~' + name : ''}`)
    }))
   // console.log(list.join(', '))
  }

  if (/document/i.test(m.mtype)) console.log(`Archivo: ${m.msg?.fileName || m.msg?.displayName || 'Document'}`)
  else if (/contact/i.test(m.mtype)) console.log(`Contacto: ${m.msg?.displayName || ''}`)
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg?.seconds || 0
    console.log(`${m.msg?.ptt ? 'PTT' : 'Audio'} | Duración: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`)
  }

  console.log()
}

const file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.redBright("Archivo actualizado: 'lib/console.js'"))
})