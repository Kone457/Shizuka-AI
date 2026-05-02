import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, generateWAMessageFromContent, proto } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let rtx = `
> 𝗩𝗶𝗻𝗰𝘂𝗹𝗮𝗰𝗶𝗼́𝗻 vía 𝗤𝗥
> ✿ *Escaneá este QR* con otro celular o PC para ser un *Sub-Bot temporal.*

> ✿ *Pasos:*
> ✿ Abre los *tres puntos* arriba a la derecha  
> ✿ Toca *Dispositivos vinculados*  
> ✿ Escanea el *código QR* para iniciar sesión

`.trim()
let rtx2 = `
> 𝗩𝗶𝗻𝗰𝘂𝗹𝗮𝗰𝗶𝗼́𝗻 vía 𝗖𝗼𝗱𝗲
> ✿ Usa este *código* para ser un *Sub-Bot temporal.*

> ✿ *Pasos:*
> ✿ Abre los *tres puntos* arriba a la derecha  
> ✿ Toca *Dispositivos vinculados*  
> ✿ Selecciona *Vincular con número de teléfono*  
> ✿ Ingresa el *código* de vinculación.

`.trim()

const IMAGE_URL = `${banner}`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MAX_SUBBOTS = 10

if (global.conns instanceof Array) console.log()
else global.conns = []

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

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd) {
    return m.reply(`✿ *Este comando esta deshabilitado.*`)
  }

  const activeConns = global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
  if (activeConns.length >= MAX_SUBBOTS) {
    return m.reply(`✿ *Lo siento, se ha alcanzado el límite de ${MAX_SUBBOTS} subbots.*`)
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

async function downloadImage(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer)
  } catch (error) {
    console.error('Error descargando imagen:', error)
    return null
  }
}

export async function skyJadiBot(options) {
  let { pathSkyJadiBot, m, conn, args, usedPrefix, command, fromCommand } = options
  let isInit = true
  let isSent = false

  if (!fs.existsSync(pathSkyJadiBot)) fs.mkdirSync(pathSkyJadiBot, { recursive: true })

  const mcode = fromCommand && (command === 'code' || args?.includes('code'))
  const { state, saveCreds } = await useMultiFileAuthState(pathSkyJadiBot)
  const { version } = await fetchLatestBaileysVersion()

  const browserInfo = mcode 
    ? ['Ubuntu', 'Chrome', '110.0.5585.95'] 
    : ['Sky Bot', 'Chrome', '2.0.0']

  const connectionOptions = {
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
    browser: browserInfo,
    version,
    msgRetryCounterCache: new NodeCache()
  }

  let sock = makeWASocket(connectionOptions)

  // ✔ guardar plataforma/navegador correctamente
  sock.browserInfo = browserInfo

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update
    const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

    if (qr && fromCommand && !mcode && !isSent) {
      const imageBuffer = await downloadImage(IMAGE_URL)

      if (imageBuffer) {
        await conn.sendMessage(m.chat, {
          image: imageBuffer,
          caption: rtx,
          jpegThumbnail: imageBuffer,
          mentions: [m.sender]
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
          image: await qrcode.toBuffer(qr, { scale: 8 }),
          caption: "📱 *Escanea este código QR:*"
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          image: await qrcode.toBuffer(qr, { scale: 8 }),
          caption: rtx
        }, { quoted: m })
      }
      isSent = true
    }

    if (qr && fromCommand && mcode && !isSent) {
      try {
        let secret = await sock.requestPairingCode((m.sender.split`@`[0]))

        const imageBuffer = await downloadImage(IMAGE_URL)

        if (imageBuffer) {
          await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: rtx2,
            jpegThumbnail: imageBuffer
          }, { quoted: m })

          await conn.reply(m.chat, secret, m)
        } else {
          await conn.reply(m.chat, rtx2, m)
          await conn.reply(m.chat, secret, m)
        }
        isSent = true
      } catch (error) {
        console.error('Error generando código:', error)
        await conn.reply(m.chat, "❌ Error generando código de vinculación", m)
      }
    }

    if (connection === 'open') {
      sock.isInit = true
      isSent = true

      // ✔ asegurar que tenga plataforma visible
      sock.user = sock.user || {}
      sock.user.platform = browserInfo[1] || 'Desconocido'

      if (!global.conns.includes(sock)) global.conns.push(sock)

      console.log(chalk.cyanBright(`\n❒⸺⸺⸺⸺【• SKY-BOT •】⸺⸺⸺⸺❒\n│ 🟢 Conectado: ${sock.user.id}\n❒⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺❒`))

      if (fromCommand) {
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