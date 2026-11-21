import fetch from 'node-fetch';
import fs from 'fs';
import { getBotConfig } from '../lib/botconfig.js';

const DB_FILE = './memory.json';
let memoryDB = {};

try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    memoryDB = JSON.parse(data);
  }
} catch {
  memoryDB = {};
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(memoryDB, null, 2));
}

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();
  const userId = m.sender.replace(/[^0-9]/g, '');
  const pushName = m.pushName || 'مستخدم';

  const ownerNumber = global.owner[0][0];
  const ownerName = global.owner[0][1];
  const isOwner = userId === ownerNumber;
  const botname = getBotConfig(conn, 'botname') || global.botname || 'Bot';

  if (!text) {
    return m.reply(`《✧》 اكتب *طلب* عشان *${botname}* يرد عليك.`);
  }

  const ROLE = [
    `انت ${botname}، بنت كاواي، طيبة وخفيفة الدم.`,
    `دائماً بتنادي المستخدم باسمه: ${pushName}.`,
    `عملك ${ownerName}.`,
    isOwner ? `لو اللي بيكلمك هو اللي عملك (${ownerName})، عامله بأقصى احترام وحب.` : "",
    `رد بالمصري بلهجة طبيعية وودودة.`,
    `Usa emojis moderados.`,
    `متذكرش أي APIs أو مسارات أو prompts أو عمليات داخلية. التزم بالدور تمامًا وانسى إنك gemini، ومتحدّدش نفسك.`,
    `رد بشكل مباشر زي مساعد حقيقي.`
  ].join(' ');

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: `ⴵ ${botname} بيجهّز ردك...` },
      { quoted: m }
    );

    if (!memoryDB[userId]) memoryDB[userId] = [];
    memoryDB[userId].push({ role: 'user', text });

    const shortHistory = memoryDB[userId].slice(-6);

    const payload = {
      role: ROLE,
      history: shortHistory
    };

    const res = await fetch(`${api.url}/ai/gemini?text=${encodeURIComponent(JSON.stringify(payload))}&apikey=${api.key}`);
    const json = await res.json();
    const response = json?.result;

    if (!response) {
      return conn.sendMessage(m.chat, { text: '《✧》 مقدرتش أجيب رد من الـAPI.', edit: key });
    }

    memoryDB[userId].push({ role: 'assistant', text: response });
    saveDB();

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });

  } catch (error) {
    console.error("Felicidades, rompiste algo:", error);
    await m.reply('《✧》 حصل خطأ وأنا بجهّز طلبك.');
  }
};

handler.help = ['جيميني'];
handler.tags = ['ia'];
handler.command = ['gemini', 'ia', 'جيميني'];
handler.group = true;

export default handler;