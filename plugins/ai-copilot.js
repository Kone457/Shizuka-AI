import fetch from 'node-fetch';
import fs from 'fs';

const COPILOT_PATH = 'https://api.stellarwa.xyz/ai/copilot';
const API_KEY = 'stellar-EBo93V1d';
const MEMORY_FILE = './copilot_memory.json';

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();
  const memory = loadMemory();

  if (!text) {
    return m.reply('> Escribe una *petición* para que *Copilot* te responda.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> *Copilot* está procesando tu respuesta...' },
      { quoted: m }
    );

    const previous = memory[m.sender] ? `\nContexto previo: ${memory[m.sender].last}` : '';
    const res = await fetch(
      `${COPILOT_PATH}?text=${encodeURIComponent(text + previous)}&key=${API_KEY}`
    );
    const json = await res.json();

    const response = json?.response;

    if (!response) {
      return conn.reply(m.chat, '> No se pudo obtener una *respuesta* válida.');
    }

    memory[m.sender] = { last: text, reply: response };
    saveMemory(memory);

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('️> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['copilot'];
handler.tags = ['ia'];
handler.command = ['copilot', 'cpt'];

export default handler;