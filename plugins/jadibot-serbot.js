import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, proto } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let rtx = `> *Vincula el subbot usando el código QR.*`.trim()
let rtx2 = `> *Vincula el subbot usando el código de 8 dígitos.*`.trim()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MAX_SUBBOTS = 10

if (!(global.conns instanceof Array)) global.conns = []

async function loadSubbots() {
  if (!fs.existsSync(`./${global.jadi}`)) return
  const folders = fs.readdirSync(`./${global.jadi}`)
  for (const folder of folders) {
    const pathSkyJadiBot = path.join(`./${global.jadi}/`, folder)
    if (fs.statSync(pathSkyJadiBot).isDirectory() && fs.existsSync(path.join(pathSkyJadiBot, 'creds.json'))) {
      skyJadiBot({ pathSkyJadiBot, fromCommand: false })
    }
  }
}
loadSubbots().catch(console.error)

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd) {
    return m.reply(`*Este comando está deshabilitado por mi creador.*`)
  }

  const activeConns = global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
  if (activeConns.length >= MAX_SUBBOTS) {
    return m.reply(`*Se alcanzó el límite de ${MAX_SUBBOTS} subbots.*`)
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathSkyJadiBot = path.join(`./${jadi}/`, id)

  skyJadiBot({ pathSkyJadiBot, m, conn, args, usedPrefix, command, fromCommand: true })
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

export async function skyJadiBot(options) {
  let { pathSkyJadiBot, m, conn, args, usedPrefix, command, fromCommand } = options
  let isSent = false
  
  if (!fs.existsSync(pathSkyJadiBot)) fs.mkdirSync(pathSkyJadiBot, { recursive: true })

  const mcode = fromCommand && (command === 'code' || args?.includes('code'))
  const { state, saveCreds } = await useMultiFileAuthState(pathSkyJadiBot)
  const { version } = await fetchLatestBaileysVersion()

  const connectionOptions = {
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
    browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Sky Bot','Chrome','2.0.0'],
    version,
    msgRetryCounterCache: new NodeCache()
  }

  let sock = makeWASocket(connectionOptions)
  sock.isFirstConnect = false

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update
    const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

    if (qr && fromCommand && !mcode && !isSent) {
      await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx }, { quoted: m })
      isSent = true
    }

    if (qr && fromCommand && mcode && !isSent) {
      let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
      secret = secret.match(/.{1,4}/g)?.join("-")
      await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
      await conn.sendMessage(m.chat, { text: secret }, { quoted: m })
      isSent = true
    }

    if (connection === 'open') {
      isSent = true
      if (!global.conns.includes(sock)) global.conns.push(sock)
      console.log(chalk.cyanBright(`\n🟢 Conectado: ${sock.user.id}`))

      if (fromCommand && !sock.isFirstConnect) {
        await sock.sendMessage(m.chat, { text: '*¡Conectado con éxito!*' }, { quoted: m })
        sock.isFirstConnect = true
        options.fromCommand = false
      }
    }

    if (connection === 'close') {
      isSent = false
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow(`\n⚠️ Reconectando subbot: ${path.basename(pathSkyJadiBot)}`))
        setTimeout(() => {
          skyJadiBot({ ...options, fromCommand: false })
        }, 5000)
      } else {
        console.log(chalk.red(`\n❌ Sesión cerrada: ${path.basename(pathSkyJadiBot)}`))
        try {
          if (fs.existsSync(pathSkyJadiBot)) {
            fs.rmSync(pathSkyJadiBot, { recursive: true, force: true })
          }
        } catch (e) {
          console.error(e)
        }
        let i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
      }
    }
  }

  let handlerModule = await import('../handler.js')
  sock.handler = handlerModule.handler.bind(sock)
  sock.connectionUpdate = connectionUpdate.bind(sock)
  sock.credsUpdate = saveCreds.bind(sock, true)

  sock.ev.on("messages.upsert", sock.handler)
  sock.ev.on("connection.update", sock.connectionUpdate)
  sock.ev.on("creds.update", sock.credsUpdate)

  return sock
}