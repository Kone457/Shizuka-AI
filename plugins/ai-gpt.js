import fetch from 'node-fetch';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const GEMINI_API_KEY = 'AIzaSyDRdEvBR4_9bj3159KsDlgJxux9R-5CMwA';
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_PATH = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SHIZUKA_ROLE = [
  "Eres Shizuka y respondes con ternura y muchos emojis en tus respuestas.",
  "Eres dulce, amable y siempre transmites calma y cariño.",
  "Da respuestas cortas pero precisas.",
].join(' ');

let db;
(async () => {
  db = await open({
    filename: './gemini_memory.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS memory (
      chatId TEXT,
      role TEXT,
      text TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

let handler = async (m, { conn, args }) => {
  const userText = args.join(' ').trim();
  const chatId = m.chat;

  if (!userText) {
    return m.reply('> Escribe una *petición* para que *Shizuka* te responda...');
  }

  try {
    const { key } = await conn.sendMessage(
      chatId,
      { text: '> *Shizuka* está pensando, espere...' },
      { quoted: m }
    );

    await db.run(`INSERT INTO memory (chatId, role, text) VALUES (?, ?, ?)`, [chatId, 'user', userText]);

    const rows = await db.all(`SELECT role, text FROM memory WHERE chatId = ? ORDER BY timestamp ASC`, [chatId]);

    const payload = {
      contents: [
        {
          parts: [
            { text: SHIZUKA_ROLE },
            ...rows.map(msg => ({ text: msg.text }))
          ]
        }
      ]
    };

    const res = await fetch(GEMINI_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText || 'Error en la solicitud'}`);
    }

    const json = await res.json();
    const candidate = json?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const response = parts.map(p => p.text || '').join('\n').trim();

    if (!response) {
      await conn.sendMessage(chatId, { text: '> No se obtuvo una *respuesta* válida.', edit: key });
      return;
    }

    await db.run(`INSERT INTO memory (chatId, role, text) VALUES (?, ?, ?)`, [chatId, 'assistant', response]);

    await conn.sendMessage(chatId, { text: response, edit: key });
  } catch (error) {
    console.error('[Shizuka-IA] Error:', error);
    await m.reply('> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['ia', 'gemini'];
handler.tags = ['ia'];
handler.command = ['ia', 'gemini'];

export default handler;