import {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import nodeCache from "node-cache";
import fs from "fs";
import fetch from "node-fetch";
import path from "path";
import pino from "pino";
import util from "util";
import * as ws from "ws";
const { child, spawn, exec } = await import("child_process");
import { makeWASocket } from "../lib/simple.js";

// Variables de entorno/comprobación (Se mantienen igual)
let crm1 = "cd plugins", crm2 = "; md5sum", crm3 = "Sinfo-Donar.js", crm4 = " _autoresponder.js info-bot.js";
let imgcode = 'https://files.catbox.moe/nig8ax.jpg';

let fkontak = {
    key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
    message: {
      locationMessage: {
        name: "𝖲𝖴𝖡𝖡𝖮𝖳 𝖮𝖭𝖫𝖨𝖭𝖤 ✅",
        jpegThumbnail: await (await fetch('https://files.catbox.moe/nig8ax.jpg')).buffer(),
        vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:Unlimited\nEND:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
};

let rtx = "✿ Conexión Sub-Bot Modo QR\n\nEscanea este QR para convertirte en Subbot.";
let rtx2 = "✿ Conexión Sub-Bot Modo Código\n\nUsa este Código para vincular.";

if (!(global.conns instanceof Array)) global.conns = [];
const MAX_SUBBOTS = 10;

async function loadSubbots() {
  const serbotFolders = fs.readdirSync('./' + global.jadi).filter(f => fs.statSync(`./${global.jadi}/${f}`).isDirectory());
  let totalC = 0;

  for (const folder of serbotFolders) {
    if (global.conns.length >= MAX_SUBBOTS) {
      console.log(`Límite de ${MAX_SUBBOTS} subbots alcanzado.`);
      break;
    }

    const folderPath = `./${global.jadi}/${folder}`;
    const { state, saveCreds } = await useMultiFileAuthState(folderPath);
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
      version,
      keepAliveIntervalMs: 30000,
      printQRInTerminal: false,
      logger: pino({ level: "fatal" }),
      auth: state,
      browser: ["Dylux", "IOS", "4.1.0"],
    };

    let conn = makeWASocket(connectionOptions);
    let connected = false;
    let recAtts = 0;

    async function connectionUpdate(update) {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        connected = true;
        global.conns.push(conn);
        totalC++;
      }
      
      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode;
        if (code !== DisconnectReason.loggedOut && recAtts < 3) {
            recAtts++;
            console.log(`Reintentando conexión para ${folder}...`);
            setTimeout(() => loadSubbots(), 5000); 
        } else {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
      }
    }
    // ... (resto de la lógica de inicialización simplificada para evitar errores de anidación)
  }
}

let handler = async (msg, { conn, args, usedPrefix, command }) => {
  if (!global.db.data.settings[conn.user.jid]?.jadibotmd) {
    return conn.reply(msg.chat, "Este comando está deshabilitado.", msg);
  }

  if (global.conns.length >= MAX_SUBBOTS) {
    return conn.reply(msg.chat, `Límite alcanzado: ${MAX_SUBBOTS} subbots.`, msg);
  }

  const isCode = command === "code" || (args[0] && /(--code|code)/.test(args[0]));
  let userJid = msg.mentionedJid?.[0] || (msg.fromMe ? conn.user.jid : msg.sender);
  let userName = userJid.split('@')[0];
  let pathSubbot = `./${global.jadi}/${userName}`;

  if (!fs.existsSync(pathSubbot)) fs.mkdirSync(pathSubbot, { recursive: true });

  async function initSubBot() {
    const { state, saveCreds } = await useMultiFileAuthState(pathSubbot);
    const config = {
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      auth: state,
      browser: isCode ? ["Ubuntu", "Chrome", "110.0.5585.95"] : ["Sub Bot", "Chrome", "2.0.0"],
    };

    let subBot = makeWASocket(config);

    subBot.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr && !isCode) {
        await conn.sendMessage(msg.chat, { image: await qrcode.toBuffer(qr), caption: rtx }, { quoted: msg });
      }

      if (qr && isCode) {
        await conn.sendMessage(msg.chat, { image: { url: imgcode }, caption: rtx2 }, { quoted: msg });
        await sleep(3000);
        let codeP = await subBot.requestPairingCode(msg.sender.split('@')[0]);
        await conn.sendMessage(msg.chat, { text: codeP }, { quoted: msg });
      }

      if (connection === "open") {
        global.conns.push(subBot);
        await conn.sendMessage(msg.chat, { text: "✅ Conexión exitosa." }, { quoted: fkontak });
      }

      if (connection === "close") {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
            fs.rmSync(pathSubbot, { recursive: true, force: true });
        }
      }
    });

    subBot.ev.on('creds.update', saveCreds);
  }

  initSubBot();
};

handler.help = ["serbot", "code"];
handler.tags = ["serbot"];
handler.command = ["jadibot", "serbot", "code"];

export default handler;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
