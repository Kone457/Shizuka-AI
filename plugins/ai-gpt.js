import axios from 'axios';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

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

    const messages = [
      { role: "system", content: SHIZUKA_ROLE },
      ...rows.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.text
      }))
    ];

    const params = {
      query: JSON.stringify(messages),
      link: "writecream.com"
    };

    const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat?" + new URLSearchParams(params);

    const { data } = await axios.get(url, {
      headers: { 
        'accept': '*/*',
        'user-agent': 'Mozilla/5.0' 
      }
    });

    const response = data?.response_content?.trim();

    if (!response) {
      await conn.sendMessage(chatId, { text: '> No se obtuvo una *respuesta* válida.', edit: key });
      return;
    }

    await db.run(`INSERT INTO memory (chatId, role, text) VALUES (?, ?, ?)`, [chatId, 'assistant', response]);

    await conn.sendMessage(chatId, { text: response, edit: key });

  } catch (error) {
    await m.reply('> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['ia', 'gpt', 'shizuka'];
handler.tags = ['ia'];
handler.command = ['ia', 'gpt', 'shizuka'];

export default handler;
