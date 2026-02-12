import ws from 'ws'
import moment from 'moment'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import gradient from 'gradient-string'
import seeCommands from './lib/system/commandLoader.js'
import initDB from './lib/system/initDB.js'
import antilink from './plugins/_antilink.js'
import level from './plugins/_level.js'
import { getGroupAdmins } from './lib/message.js'

seeCommands()

export default async (client, m) => {
  if (!m.message) return

  const sender = m.sender

  let body =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.videoMessage?.caption ||
    m.message.buttonsResponseMessage?.selectedButtonId ||
    m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.message.templateButtonReplyMessage?.selectedId ||
    (
      m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
        ? (() => {
            try {
              const json = JSON.parse(
                m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson
              )
              return json.id || json?.reply?.id || ''
            } catch {
              return ''
            }
          })()
        : ''
    )

  if (!body) return

  initDB(m, client)
  antilink(client, m)

  const from = m.key.remoteJid
  const idDD = client.user.id.split(':')[0] + '@s.whatsapp.net' || ''

  const rawPrefijo = global.db.data.settings[idDD]?.prefijo || ''
  const prefas = Array.isArray(rawPrefijo)
    ? rawPrefijo
    : rawPrefijo
    ? [rawPrefijo]
    : ['#', '.', '/']

  const rawBotname = global.db.data.settings[idDD]?.namebot2
  const isValidBotname = /^[\w\s]+$/.test(rawBotname)
  const botname2 = isValidBotname ? rawBotname : 'Yot'

  const shortForms = [
    botname2.charAt(0),
    botname2.split(' ')[0],
    botname2.split(' ')[0].slice(0, 2),
    botname2.split(' ')[0].slice(0, 3)
  ]

  const prefixes = shortForms.map(name => `${name}`)
  prefixes.unshift(botname2)
  const prefixo = prefas.join('')

  globalThis.prefix = new RegExp(`^(${prefixes.join('|')})?[${prefixo}]`, 'i')

  let prefixMatch = body.match(globalThis.prefix)

  // soporte para botones nativeFlow
  if (!prefixMatch && m.message?.interactiveResponseMessage) {
    prefixMatch = ['']
  }

  if (!prefixMatch) return

  const usedPrefix = prefixMatch[0]

  const args = body.slice(usedPrefix.length).trim().split(/ +/)
  const command = args.shift()?.toLowerCase()
  const text = args.join(' ')

  if (!command) return

  const pushname = m.pushName || 'Sin nombre'
  const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net' || client.user.lid
  const chat = global.db.data.chats[m.chat] || {}

  let groupMetadata = null
  let groupAdmins = []
  let groupName = ''

  if (m.isGroup) {
    groupMetadata = await client.groupMetadata(m.chat).catch(() => null)
    groupName = groupMetadata?.subject || ''
    groupAdmins = groupMetadata?.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin') || []
  }

  const isBotAdmins = m.isGroup
    ? groupAdmins.some(p => [p.phoneNumber, p.jid, p.id, p.lid].includes(botJid))
    : false

  const isAdmins = m.isGroup
    ? groupAdmins.some(p => [p.phoneNumber, p.jid, p.id, p.lid].includes(sender))
    : false

  const fromprimary = global.db.data.chats[from]
  const consolePrimary = fromprimary?.primaryBot

  if (!consolePrimary || consolePrimary === botJid) {
    const h = chalk.bold.blue('************************************')
    const v = chalk.bold.white('*')
    console.log(
      `\n${h}\n${chalk.bold.yellow(`${v} Fecha: ${chalk.whiteBright(moment().format('DD/MM/YY HH:mm:ss'))}`)}\n${chalk.bold.blueBright(`${v} Usuario: ${chalk.whiteBright(pushname)}`)}\n${chalk.bold.magentaBright(`${v} Remitente: ${gradient('deepskyblue', 'darkorchid')(sender)}`)}\n${m.isGroup ? chalk.bold.cyanBright(`${v} Grupo: ${chalk.greenBright(groupName)}\n${v} ID: ${gradient('violet', 'midnightblue')(from)}\n`) : chalk.bold.greenBright(`${v} Chat privado\n`)}${h}`
    )
  }

  const chatData = global.db.data.chats[m.chat]
  const botprimaryId = chatData?.primaryBot
  const selfId = botJid

  if (botprimaryId && botprimaryId !== selfId) {
    const isPrimarySelf = botprimaryId === global.client.user.id.split(':')[0] + '@s.whatsapp.net'
    if (isPrimarySelf) return
  }

  const isVotOwn = [botJid, ...global.owner.map(num => num + '@s.whatsapp.net')].includes(sender)

  if (global.db.data.settings[selfId]?.self) {
    const owner = global.db.data.settings[selfId].owner
    if (sender !== owner && !isVotOwn && !global.mods.map(num => num + '@s.whatsapp.net').includes(sender)) return
  }

  if (m.chat && !m.chat.endsWith('g.us')) {
    const allowedInPrivate = ['report', 'reporte', 'sug', 'suggest', 'invite', 'invitar', 'setname', 'setbotname', 'setstatus', 'reload']
    const owners = global.db.data.settings[selfId]?.owner
    if (sender !== owners && !isVotOwn && !allowedInPrivate.includes(command)) return
  }

  if (chat?.bannedGrupo && !isVotOwn) return
  if (chat.adminonly && !isAdmins) return

  const cmdData = global.comandos.get(command)

  if (!cmdData) return

  if (cmdData.isOwner && !isVotOwn) return
  if (cmdData.isModeration && !global.mods.map(num => num + '@s.whatsapp.net').includes(sender)) return
  if (cmdData.isAdmin && !isAdmins) return client.reply(m.chat, 'Este comando es solo para admins.', m)
  if (cmdData.botAdmin && !isBotAdmins) return client.reply(m.chat, 'Necesito ser admin para ejecutar esto.', m)

  try {
    await client.readMessages([m.key])

    const user = (global.db.data.chats[m.chat].users[m.sender] ||= {})
    const user2 = (global.db.data.users[m.sender] ||= {})

    user2.usedcommands = (user2.usedcommands || 0) + 1
    user.usedTime = new Date()
    user2.exp = (user2.exp || 0) + Math.floor(Math.random() * 100)
    user2.name = m.pushName

    await cmdData.run(client, m, args, command, text)
  } catch (error) {
    console.error(error)
    await client.sendMessage(
      m.chat,
      { text: `🗞 Error al ejecutar el comando\n${error}` },
      { quoted: m }
    )
  }

  level(m)
}