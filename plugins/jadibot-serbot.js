import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, generateWAMessageFromContent, proto } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MAX_SUBBOTS = 10

if (!global.conns) global.conns = []

async function loadSubbots() {
  const sessionPath = `./${global.jadi}`
  if (!fs.existsSync(sessionPath)) return
  const folders = fs.readdirSync(sessionPath)
  for (const folder of folders) {
    const pathSkyJadiBot = path.join(sessionPath, folder)
    if (fs.statSync(pathSkyJadiBot).isDirectory() && fs.existsSync(path.join(pathSkyJadiBot, 'creds.json'))) {
      skyJadiBot({ pathSkyJadiBot, fromCommand: false })
    }
  }
}
loadSubbots().catch(console.error)

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db.data.settings[conn.user.jid]?.jadibotmd) {
    return m.reply(`*Este comando está deshabilitado.*`)
  }

  const activeConns = global.conns.filter(c => c.ws?.readyState === ws.OPEN)
  if (activeConns.length >= MAX_SUBBOTS) {
    return m.reply(`*Límite alcanzado.*`)
  }

  let id = m.sender.split('@')[0]
  let pathSkyJadiBot = path.join(`./${global.jadi}/`, id)

  skyJadiBot({ pathSkyJadiBot, m, conn, args, command, fromCommand: true })
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function skyJadiBot(options) {
  let { pathSkyJadiBot, m, conn, args, command, fromCommand } = options
  let isSent = false
  
  if (!fs.existsSync(pathSkyJadiBot)) fs.mkdirSync(pathSkyJadiBot, { recursive: true })

  const mcode = fromCommand && (command === 'code' || args?.includes('code'))
  const { state, saveCreds } = await useMultiFileAuthState(pathSkyJadiBot)
  const { version } = await fetchLatestBaileysVersion()

  const connectionOptions = {
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: { 
      creds: state.creds, 
      keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
    },
    browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Sky Bot','Chrome','2.0.0'],
    version,
    msgRetryCounterCache: new NodeCache()
  }

  let sock = makeWASocket(connectionOptions)

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update
    const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

    if (qr && fromCommand && !mcode && !isSent) {
      await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: `> *Vincula el subbot usando el código QR.*` }, { quoted: m })
      isSent = true
    }

    if (qr && fromCommand && mcode && !isSent) {
      await conn.reply(m.chat, `> *Vincula el subbot usando el código de 8 dígitos.*`, m)
      let secret = await sock.requestPairingCode(m.sender.split`@`[0])
      await conn.reply(m.chat, secret.match(/.{1,4}/g)?.join("-"), m)
      isSent = true
    }

    if (connection === 'open') {
      sock.isInit = true
      if (!global.conns.some(c => c.user?.id === sock.user?.id)) global.conns.push(sock)
      console.log(chalk.cyanBright(`\n🟢 Conectado: ${sock.user.id}`))
      
      if (fromCommand) {
        // Delay de 2 segundos para asegurar que el socket esté listo antes de avisar
        setTimeout(async () => {
          await conn.sendMessage(m.chat, { text: `*¡Conexión exitosa!*\n\nEl subbot se ha vinculado correctamente a la sesión de Carlos.` }, { quoted: m })
        }, 2000)
        options.fromCommand = false 
      }
    }

    if (connection === 'close') {
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        setTimeout(() => skyJadiBot({ ...options, fromCommand: false }), 7000)
      } else {
        if (fs.existsSync(pathSkyJadiBot)) fs.rmSync(pathSkyJadiBot, { recursive: true, force: true })
        global.conns = global.conns.filter(c => c.user?.id !== sock.user?.id)
      }
    }
  }

  const handlerModule = await import('../handler.js')
  sock.handler = handlerModule.handler.bind(sock)
  sock.connectionUpdate = connectionUpdate.bind(sock)
  sock.credsUpdate = saveCreds.bind(sock, true)

  sock.ev.on("messages.upsert", sock.handler)
  sock.ev.on("connection.update", sock.connectionUpdate)
  sock.ev.on("creds.update", sock.credsUpdate)

  return sock
}
