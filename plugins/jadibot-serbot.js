const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"));
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

// Emojis para una mejor presentación
const emojis = {
  check: '✅',
  x: '❌',
  info: 'ℹ️',
  warning: '⚠️',
  rocket: '🚀',
  robot: '🤖',
  wave: '👋',
  qr: '🔳',
  code: '🔢',
  start: '┏━━❲ ✨S H I Z U K A - A I✨ ❳━━',
  end: '┗━━━━━━━━━━━━━━━━━━━━━━━'
};

let crm1 = "Y2QgcGx1Z2lucw"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

let rtx = `
${emojis.start}
${emojis.qr} *Conexión Sub-Bot Modo QR*
    
Con otro celular o en la PC escanea este código para convertirte en un Sub-Bot Temporal.

\`1\` » Toca los tres puntos en la esquina superior derecha de WhatsApp.
\`2\` » Selecciona *Dispositivos Vinculados*.
\`3\` » Escanea este código QR para iniciar sesión con el bot.

${emojis.info} Este código QR expira en 45 segundos.
${emojis.end}
`.trim();

let rtx2 = `
${emojis.start}
${emojis.code} *Conexión Sub-Bot mediante Código*
    
Sigue estos pasos para convertirte en Sub-Bot.

\`1\` » Toca los tres puntos en la esquina superior derecha de WhatsApp.
\`2\` » Selecciona *Dispositivos Vinculados*.
\`3\` » Toca *Vincular con el número de teléfono*.
\`4\` » Escribe el código que te enviaré para iniciar sesión.

${emojis.info} Este código expira en 45 segundos.
${emojis.end}
`.trim();


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const yukiJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
//if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(♡ Comando desactivado temporalmente.)

const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
if (subBotsCount === 20) {
  const fullMsg = `
${emojis.start}
${emojis.x} *Límite de Sub-Bots*
    
No se han encontrado espacios para Sub-Bots disponibles en este momento. Inténtelo más tarde.
${emojis.end}
  `;
  return m.reply(fullMsg);
}

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = who.split('@')[0]
let pathYukiJadiBot = path.join(`./${jadi}/`, id)

if (!fs.existsSync(pathYukiJadiBot)){
  fs.mkdirSync(pathYukiJadiBot, { recursive: true })
}

yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot
yukiJBOptions.m = m
yukiJBOptions.conn = conn
yukiJBOptions.args = args
yukiJBOptions.usedPrefix = usedPrefix
yukiJBOptions.command = command
yukiJBOptions.fromCommand = true
yukiJadiBot(yukiJBOptions)
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options
  
  const isCodeCommand = command === 'code';
  
  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  if (!fs.existsSync(pathYukiJadiBot)){
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  }

  try {
    if (args[0] && args[0] !== 'undefined') {
      fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
    }
  } catch (error) {
    const errorMsg = `
${emojis.start}
${emojis.x} *Error al vincular*
    
Parece que el código de la sesión no es válido.
Por favor, asegúrese de usar el comando correctamente: \`${usedPrefix + command} <code>\`
${emojis.end}
    `;
    conn.reply(m.chat, errorMsg, m);
    return;
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    const drmer = Buffer.from(drm1 + drm2, 'base64')

    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
      msgRetry,
      msgRetryCache,
      browser: isCodeCommand ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Yuki-Suou (Sub Bot)', 'Chrome','2.0.0'],
      version: version,
      generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      if (qr && !isCodeCommand) {
        if (m?.chat) {
          txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
        } else {
          return
        }
        if (txtQR && txtQR.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 45000)
        }
        return
      }

      if (qr && isCodeCommand) {
        let secret = await sock.requestPairingCode((m.sender.split('@')[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")
        txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
        codeBot = await m.reply(secret)
        console.log(chalk.bold.green(`\n${emojis.code} Código de emparejamiento para ${m.sender.split('@')[0]}: ${secret}\n`))
      }

      if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 45000)
      }
      if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 45000)
      }

      const endSesion = async (loaded) => {
        if (!loaded) {
          try {
            sock.ws.close()
          } catch {
          }
          sock.ev.removeAllListeners()
          let i = global.conns.indexOf(sock)
          if (i < 0) return
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      
      if (connection === 'close') {
        const pathBaseName = path.basename(pathYukiJadiBot);
        let consoleMsg = `\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${pathBaseName}) `;
        let userMsg = '';
        let shouldRestart = false;
        let shouldRemove = false;

        switch (reason) {
          case DisconnectReason.connectionClose:
          case 428:
            consoleMsg += `fue cerrada inesperadamente. Intentando reconectar...\n`;
            shouldRestart = true;
            break;
          case DisconnectReason.connectionLost:
          case 408:
            consoleMsg += `se perdió o expiró. Intentando reconectar...\n`;
            shouldRestart = true;
            break;
          case DisconnectReason.connectionReplaced:
          case 440:
            consoleMsg += `fue reemplazada por otra sesión. Por favor, elimine la nueva sesión para continuar.\n`;
            userMsg = `${emojis.warning} Se ha detectado una nueva sesión. Por favor, elimine la sesión más reciente para volver a conectarse.`;
            break;
          case DisconnectReason.loggedOut:
          case 401:
          case 405:
            consoleMsg += `fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente. Borrando datos...\n`;
            userMsg = `${emojis.x} Sesión inválida. Por favor, intente de nuevo para ser Sub-Bot.`;
            shouldRemove = true;
            break;
          case DisconnectReason.serverError:
          case 500:
            consoleMsg += `se perdió. Borrando datos...\n`;
            userMsg = `${emojis.x} La conexión se perdió. Intente nuevamente para ser Sub-Bot.`;
            shouldRestart = true;
            break;
          case DisconnectReason.restartRequired:
          case 515:
            consoleMsg += `se reiniciará automáticamente.\n`;
            shouldRestart = true;
            break;
          case DisconnectReason.forbidden:
          case 403:
            consoleMsg += `fue cerrada. La cuenta puede estar en soporte. Borrando datos...\n`;
            userMsg = `${emojis.x} Su sesión ha sido cerrada. La cuenta puede estar en soporte.`;
            shouldRemove = true;
            break;
          default:
            consoleMsg += `se ha cerrado por una razón desconocida (${reason}).\n`;
            break;
        }

        console.log(chalk.bold.magentaBright(consoleMsg + `╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`));
        
        if (userMsg && options.fromCommand) {
          try {
            await conn.sendMessage(`${pathBaseName}@s.whatsapp.net`, { text: userMsg }, { quoted: m || null });
          } catch (error) {
            console.error(chalk.bold.yellow(`Error al enviar mensaje a: +${pathBaseName}`));
          }
        }
        
        if (shouldRemove) {
          fs.rmdirSync(pathYukiJadiBot, { recursive: true });
        }
        
        if (shouldRestart) {
          return creloadHandler(true).catch(console.error);
        }
      }

      if (global.db.data == null) loadDatabase()
      
      if (connection == 'open') {
        if (!global.db.data?.users) loadDatabase()
        let userName, userJid
        userName = sock.authState.creds.me.name || 'Anónimo'
        userJid = sock.authState.creds.me.jid || `${path.basename(pathYukiJadiBot)}@s.whatsapp.net`
        
        console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathYukiJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
        
        sock.isInit = true
        global.conns.push(sock)
        await joinChannels(sock)

        const connectedMsg = `
${emojis.start}
${emojis.check} *¡Conexión exitosa!*
    
¡Bienvenido, @${m.sender.split('@')[0]}! Ya eres parte de la familia de Sub-Bots.
Estoy leyendo los mensajes entrantes...
${emojis.end}
        `;
        
        if (m?.chat) {
          await conn.sendMessage(m.chat, {
            text: connectedMsg,
            mentions: [m.sender]
          }, { quoted: m });
        }
      }
    }
    
    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch (e) { }
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i < 0) return
        delete global.conns[i]
        global.conns.splice(i, 1)
      }
    }, 60000)

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('⚠️ Nuevo error: ', e)
      }
      
      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }
      
      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
      }
      
      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
      isInit = false
      return true
    }
    creloadHandler(false)
  })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
  minutes = Math.floor((duration / (1000 * 60)) % 60)
  
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  
  return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch)) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}
