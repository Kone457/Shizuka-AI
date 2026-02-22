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
import pino from 'pino';
import fs from 'fs';
import chalk from 'chalk';
import { smsg } from './message.js';

if (!global.conns) global.conns = []
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

let isPairing = {}; 

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

export async function startSubBot(m, client, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}, isCommand = false) {
  const id = phone || (m?.sender || '').split('@')[0]
  const sessionFolder = `./Sessions/Subs/${id}`
  const senderId = m?.sender

  if (isCode && fs.existsSync(sessionFolder)) {
    try {
        if (!global.conns.find(c => c.user?.id?.includes(id))) {
            fs.rmSync(sessionFolder, { recursive: true, force: true });
        }
    } catch (e) { console.error("Error limpiando sesión:", e) }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Firefox'), 
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    markOnlineOnConnect: true,
    version,
    msgRetryCounterCache,
    userDevicesCache,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    
    if (isCode && !sock.authState.creds.registered && !isPairing[id]) {
        isPairing[id] = true; 
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phone);
                
                // Mensaje 1: Instrucciones bonitas
                const instructionText = `✨ *VINCULACIÓN EN PROCESO* ✨\n\n` +
                                     `Sigue estos pasos:\n` +
                                     `1️⃣ Abre la notificación de WhatsApp.\n` +
                                     `2️⃣ Toca en "Confirmar".\n` +
                                     `3️⃣ Pega el código que te enviaré a continuación.`;

                await client.sendMessage(chatId, { text: instructionText }, { quoted: m });

                // Esperamos un segundo para que no lleguen pegados
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Mensaje 2: EL CÓDIGO SOLO (fácil de copiar)
                // Lo enviamos en mayúsculas y sin guiones si prefieres, o con ellos.
                const cleanCode = code?.toUpperCase() || code;
                await client.sendMessage(chatId, { text: cleanCode }, { quoted: m });
                
                if (senderId) delete commandFlags[senderId];
            } catch (err) {
                console.error("Error al generar Pairing Code:", err);
                delete isPairing[id];
            }
        }, 3000); 
    }

    if (connection === 'open') {
      sock.userId = cleanJid(sock.user?.id)
      if (!global.conns.find((c) => c.userId === sock.userId)) global.conns.push(sock)
      delete isPairing[id];
      console.log(chalk.green(`✅ SUB-BOT conectado: ${sock.userId}`))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 0
      delete isPairing[id];
      if (reason !== DisconnectReason.loggedOut) {
          setTimeout(() => startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 5000)
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (let raw of messages) {
      if (!raw.message) continue
      let msg = await smsg(sock, raw)
      try { handler(sock, msg, messages) } catch (err) { console.error(err) }
    }
  })

  return sock
}
