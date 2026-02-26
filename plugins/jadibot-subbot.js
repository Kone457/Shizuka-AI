import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers
} from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import handler from '../handler.js';
import pino from 'pino';
import fs from 'fs';
import chalk from 'chalk';
import { smsg } from './message.js';

if (!global.conns) global.conns = [];
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0];

let pairingAttempted = new Set();

export async function startSubBot(m, client, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}, isCommand = false) {
  const id = phone || (m?.sender || '').split('@')[0];
  const sessionFolder = `./Sessions/Subs/${id}`; 
  const senderId = m?.sender;

  if (!fs.existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true });
  }

  if (isCode && fs.existsSync(sessionFolder) && !pairingAttempted.has(id)) {
    if (!global.conns.find(c => c.user?.id?.includes(id))) {
        fs.rmSync(sessionFolder, { recursive: true, force: true });
        fs.mkdirSync(sessionFolder, { recursive: true });
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
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

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jid.match(/(\d+)(:\d+)?@/gi) || [];
      return decode[0].replace(/:\d+@/gi, '@');
    }
    return jid.replace(/:\d+@/gi, '@');
  };

  sock.ev.on('creds.update', saveCreds);

  if (isCode && !sock.authState.creds.registered && !pairingAttempted.has(id)) {
      pairingAttempted.add(id);
      setTimeout(async () => {
          try {
              const cleanPhone = phone.replace(/[^0-9]/g, '');
              let code = await sock.requestPairingCode(cleanPhone);
              let formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
              await client.sendMessage(chatId, { text: formattedCode.toUpperCase() }, { quoted: m });
              if (senderId) delete commandFlags[senderId];
          } catch (err) {
              pairingAttempted.delete(id);
              console.error(chalk.red("Error: "), err);
          }
      }, 4000); 
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      pairingAttempted.delete(id);
      sock.userId = cleanJid(sock.user?.id);
      if (!global.conns.find((c) => c.userId === sock.userId)) global.conns.push(sock);
      console.log(chalk.green(`✅ conectado: ${sock.userId}`));
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 0;
      global.conns = global.conns.filter(c => c.userId !== sock.userId);

      if (reason !== DisconnectReason.loggedOut) {
          sock.ev.removeAllListeners();
          setTimeout(() => startSubBot(m, client, caption, isCode, phone, chatId, {}, isCommand), 5000);
      } else {
          pairingAttempted.delete(id);
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
