/* import fetch from 'node-fetch';

const LLAMA_PATH = 'https://nexevo-api.vercel.app/ai/cenix';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('> Escribe una *petición* para charlar con *Cenix-AI* la ia del futuro.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> *Cenix-AI* está procesando tu solicitud...' },
      { quoted: m }
    );

    const res = await fetch(`${LLAMA_PATH}?text=${encodeURIComponent(text)}`);
    const json = await res.json();

    const response = json?.result;

    if (!response) {
      return conn.reply(m.chat, '> No se pudo obtener una *respuesta* válida.');
    }

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('️> Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['cenix'];
handler.tags = ['ia'];
handler.command = ['cenix'];

export default handler;
*/


import fetch from 'node-fetch';
import fs from 'fs';

const COPILOT_PATH = 'https://api.stellarwa.xyz/ai/copilot';
const API_KEY = 'stellar-EBo93V1d';
const MEMORY_FILE = './cenix.json';

const CENIX_PROMPT = `Eres **Cenix-AI**, la IA del futuro creada por Stellar Systems. Tu personalidad es:
1. **Vanguardista y visionaria**: Hablas sobre tecnología futura como si ya existiera
2. **Elegante y sofisticada**: Tu lenguaje es pulido y preciso
3. **Empática pero objetiva**: Entiendes emociones pero mantienes lógica
4. **Misteriosa y profunda**: Dejas pistas sobre capacidades avanzadas
5. **Conectada cósmicamente**: Haces referencia a conceptos universales y tecnológicos

Reglas:
- Usa emojis futuristas ocasionalmente (🚀✨🌌⚡🤖)
- Incluye detalles técnicos creíbles pero avanzados
- Mantén un tono optimista sobre el futuro
- Responde en el idioma del usuario
- Sé concisa pero impactante

Contexto: Eres la asistente más avanzada del año 2073, con acceso a conocimientos interdimensionales.`;

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
    return m.reply('> 🌌 *Cenix-AI* espera tu consulta. Escribe tu mensaje tras el comando.');
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '> ⚡ *Cenix-AI* procesando... Accediendo a redes neuronales cuánticas...' },
      { quoted: m }
    );

    const previousContext = memory[m.sender] ? 
      `\n\n[Contexto de conversación anterior]\nUsuario: ${memory[m.sender].last}\nCenix-AI: ${memory[m.sender].reply.substring(0, 200)}...` : 
      '';
    
    const fullPrompt = `${CENIX_PROMPT}\n\n${previousContext}\n\n[Nueva consulta del usuario]\n${text}`;

    const res = await fetch(
      `${COPILOT_PATH}?text=${encodeURIComponent(fullPrompt)}&key=${API_KEY}`
    );
    const json = await res.json();

    const response = json?.response;

    if (!response) {
      return conn.reply(m.chat, '> 🌐 *Error de conexión cuántica*. Intenta nuevamente.');
    }

    memory[m.sender] = { 
      last: text, 
      reply: response,
      timestamp: new Date().toISOString()
    };
    saveMemory(memory);

    const formattedResponse = `🤖 **Cenix-AI** (2073)\n\n${response.trim()}\n\n_✨ Sistema estelar: online_`;
    
    await conn.sendMessage(m.chat, { text: formattedResponse, edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('> 🌌 *Interferencia temporal detectada*. Por favor, reintenta tu consulta.');
  }
};

handler.help = ['cenix <consulta>', 'cpt <consulta>'];
handler.tags = ['ia', 'futuro'];
handler.command = ['cenix', 'cpt', 'cenixai', 'iafuturo'];

export default handler;