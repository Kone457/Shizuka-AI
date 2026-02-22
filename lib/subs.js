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
import { smsg } from './message.js';

if (!global.conns) global.conns = []
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

// Candado para evitar peticiones duplicadas de código
let isPairing = {}; 

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

export async function startSubBot(m, client, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}, isCommand = false) {
  const id = phone || (m?.sender || '').split('@')[0]
  const sessionFolder = `./Sessions/Subs/${id}`
  const senderId = m?.sender

  // Limpieza quirúrgica de sesiones corruptas
  if (isCode && fs.existsSync(sessionFolder)) {
    try {
        if (!global.conns.find(c => c.user?.id?.includes(id))) {
            fs.rmSync(sessionFolder, { recursive: true, force: true });
        }
    } catch (e) { console.error("Error limpiando sesión previa:", e) }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    // Cambio solicitado: Navegador Firefox (Linux) para máxima estabilidad
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
    
    // Lógica de Pairing Code mejorada
    if (isCode && !sock.authState.creds.registered && !isPairing[id]) {
        isPairing[id] = true; // Bloqueamos nuevas peticiones
        
        setTimeout(async () => {
            try {
                // Generamos el código real una sola vez
                let code = await sock.requestPairingCode(phone);
                // Le damos un formato bonito: XXXX-XXXX
                code = code?.match(/.{1,4}/g)?.join('-') || code;

                const responseText = `✨ *CÓDIGO DE VINCULACIÓN* ✨\n\n` +
                                     `🔑 Tu código es: *${code.toUpperCase()}*\n\n` +
                                     `_Cópialo y pégalo en la notificación de WhatsApp para activar tu Sub-Bot._`;

                await client.sendMessage(chatId, { text: responseText }, { quoted: m });
                
                // Limpiamos flags del comando original
                if (senderId) delete commandFlags[senderId];
            } catch (err) {
                console.error(chalk.red("Error al generar Pairing Code:"), err);
                delete isPairing[id]; // Liberamos para reintentar si falla
            }
        }, 3000); 
    }

    if (connection === 'open') {
      sock.userId = cleanJid(sock.user?.id)
      if (!global.conns.find((c) => c.userId === sock.userId)) global.conns.push(sock)
      delete isPairing[id];
      console.log(chalk.green(`✅ SUB-BOT conectado exitosamente: ${sock.userId}`))
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 0
      delete isPairing[id]; // Limpiamos rastro si se cierra
      
      if (reason !== DisconnectReason.loggedOut) {
          console.log(chalk.yellow(`🔄 Reconectando Sub-Bot: ${id}...`));
          setTimeout(() => startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 5000)
      } else {
          console.log(chalk.red(`❌ Sesión cerrada permanentemente: ${id}`));
          if (fs.existsSync(sessionFolder)) fs.rmSync(sessionFolder, { recursive: true, force: true });
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
