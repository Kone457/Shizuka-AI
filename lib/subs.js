import {
  Browsers,
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode,
} from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import handler from '../handler.js'
import events from '../plugins/_events.js'
import pino from 'pino';
import fs from 'fs';
import chalk from 'chalk';
import {smsg} from './message.js';

if (!global.conns) global.conns = []
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
let reintentos = {}

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

export async function startSubBot(m, client, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}, isCommand = false) {
  const id = phone || (m?.sender || '').split('@')[0]
  const sessionFolder = `./Sessions/Subs/${id}`
  const senderId = m?.sender

  if (isCode && fs.existsSync(sessionFolder)) {
    try {
        if (!global.conns.find(c => c.user?.id.includes(id))) {
            fs.rmSync(sessionFolder, { recursive: true, force: true });
        }
    } catch (e) { console.error("Error limpiando sesión:", e) }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"], 
    auth: state,
    markOnlineOnConnect: true,
    version,
    msgRetryCounterCache,
    userDevicesCache,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    
    if (qr && isCode && phone && commandFlags[senderId]) {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        let codeGen = await sock.requestPairingCode(phone);

        let finalCode = codeGen.replace(/-/g, '').trim(); 

        await client.sendMessage(chatId, { text: finalCode.toUpperCase() }, { quoted: m });

        delete commandFlags[senderId];
      } catch (err) {
        console.error("Error al generar Pairing Code:", err);
      }
    }

    if (connection === 'open') {
      sock.userId = cleanJid(sock.user?.id?.split('@')[0])
      if (!global.conns.find((c) => c.userId === sock.userId)) global.conns.push(sock)
      delete reintentos[sock.userId || id]
      console.log(chalk.gray(`SUB-BOT conectado: ${sock.userId}`))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 0
      if (reason !== DisconnectReason.loggedOut) {
          setTimeout(() => startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 3000)
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (let raw of messages) {
      if (!raw.message) continue
      let msg = await smsg(sock, raw)
      try { handler(sock, msg, messages) } catch (err) { console.log(err) }
    }
  })

  return sock
}
