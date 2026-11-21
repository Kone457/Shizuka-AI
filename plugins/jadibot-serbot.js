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
import { getBotConfig } from '../lib/botconfig.js'

let rtx = `
> الربط عن طريق QR
> ✿ *امسح الـQR ده* بموبايل أو كمبيوتر تاني عشان تبقى *بوت فرعي مؤقت.*

> ✿ *الخطوات:*
> ✿ افتح *التلات نقط* فوق على اليمين  
> ✿ دوس على *الأجهزة المرتبطة*  
> ✿ امسح *كود QR* عشان تسجل الدخول

`.trim()
let rtx2 = `
> الربط عن طريق الكود
> ✿ استخدم *الكود* ده عشان تبقى *بوت فرعي مؤقت.*

> ✿ *الخطوات:*
> ✿ افتح *التلات نقط* فوق على اليمين  
> ✿ دوس على *الأجهزة المرتبطة*  
> ✿ اختار *الربط برقم التليفون*  
> ✿ اكتب *كود* الربط.

`.trim()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MAX_SUBBOTS = 100

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
    return m.reply(`✿ *الأمر ده متوقف.*`)
  }

  const activeConns = global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
  if (activeConns.length >= MAX_SUBBOTS) {
    return m.reply(`✿ *معلش، وصلنا للحد الأقصى ${MAX_SUBBOTS} بوت فرعي.*`)
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathSkyJadiBot = path.join(`./${jadi}/`, id)

  skyJadiBot({ pathSkyJadiBot, m, conn, args, usedPrefix, command, fromCommand: true })
} 

handler.help = ['كود']
handler.tags = ['serbot']
handler.command = ['qr', 'code', 'كود', 'كود_qr']
export default handler 

async function downloadImage(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer)
  } catch (error) {
    console.error('خطأ في تحميل الصورة:', error)
    return null
  }
}

export async function skyJadiBot(options) {
  let { pathSkyJadiBot, m, conn, args, usedPrefix, command, fromCommand } = options
  const IMAGE_URL = conn ? getBotConfig(conn, 'banner') : global.banner
  let isInit = true
  let isSent = false

  if (!fs.existsSync(pathSkyJadiBot)) fs.mkdirSync(pathSkyJadiBot, { recursive: true })

  const mcode = fromCommand && (['code', 'كود'].includes(command) || args?.includes('code'))
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
          caption: "📱 *امسح الـQR ده:*"
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
        console.error('خطأ في توليد الكود:', error)
        await conn.reply(m.chat, "❌ خطأ في توليد كود الربط", m)
      }
    }

    if (connection === 'open') {
      sock.isInit = true
      isSent = true

      // ✔ asegurar que tenga plataforma visible
      sock.user = sock.user || {}
      sock.user.platform = browserInfo[1] || 'غير معروف'

      if (!global.conns.includes(sock)) global.conns.push(sock)

      console.log(chalk.cyanBright(`\n❒⸺⸺⸺⸺【• SKY-BOT •】⸺⸺⸺⸺❒\n│ 🟢 متصل: ${sock.user.id}\n❒⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺❒`))

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
        console.log(chalk.red(`\n❌ الجلسة اتقفلت: ${path.basename(pathSkyJadiBot)}`))
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