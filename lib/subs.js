import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import handler from '../handler.js';
import pino from 'pino';
import fs from 'fs';
import chalk from 'chalk';
import { smsg } from './message.js';

if (!global.conns) global.conns = []
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]

export async function startSubBot(m, client, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}, isCommand = false) {
  const id = phone || (m?.sender || '').split('@')[0];
  const sessionFolder = `./Sessions/Subs/${id}`;
  const senderId = m?.sender;

  if (isCode && fs.existsSync(sessionFolder)) {
    if (!global.conns.find(c => c.user?.id?.includes(id))) {
        fs.rmSync(sessionFolder, { recursive: true, force: true });
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '110.0.5506.98'], 
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    markOnlineOnConnect: true,
    version,
    msgRetryCounterCache,
    userDevicesCache,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
  });

  sock.ev.on('creds.update', saveCreds);

  if (isCode && !sock.authState.creds.registered) {
      setTimeout(async () => {
          try {
              const cleanPhone = phone.replace(/[^0-9]/g, '');
              let code = await sock.requestPairingCode(cleanPhone);
              
              const instructionText = `✨ *VINCULACIÓN EN PROCESO* ✨\n\n1️⃣ Abre la notificación de WhatsApp.\n2️⃣ Toca en "Confirmar".\n3️⃣ Pega el código que te enviaré a continuación.`;
              await client.sendMessage(chatId, { text: instructionText }, { quoted: m });

              await new Promise(resolve => setTimeout(resolve, 1500));

              let formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
              await client.sendMessage(chatId, { text: formattedCode.toUpperCase() }, { quoted: m });
              
              if (senderId) delete commandFlags[senderId];
          } catch (err) {
              console.error(chalk.red("Error pidiendo código a WhatsApp: "), err);
              client.sendMessage(chatId, { text: `❌ *Error:* WhatsApp se negó a enviar el código. Intenta con otro número o más tarde.` }, { quoted: m });
          }
      }, 3000); 
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      sock.userId = cleanJid(sock.user?.id);
      if (!global.conns.find((c) => c.userId === sock.userId)) global.conns.push(sock);
      console.log(chalk.green(`✅ SUB-BOT conectado: ${sock.userId}`));
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 0;
      if (reason !== DisconnectReason.loggedOut) {
          console.log(chalk.yellow(`🔄 Reconectando Sub-Bot: ${id}...`));
          setTimeout(() => startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 5000);
      } else {
          console.log(chalk.red(`❌ Sesión cerrada permanentemente: ${id}`));
          if (fs.existsSync(sessionFolder)) fs.rmSync(sessionFolder, { recursive: true, force: true });
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (let raw of messages) {
      if (!raw.message) continue;
      let msg = await smsg(sock, raw);
      try { handler(sock, msg, messages); } catch (err) { console.error(err); }
    }
  });

  return sock;
}
