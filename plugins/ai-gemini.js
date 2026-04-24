
import fetch from 'node-fetch';
import fs from 'fs';

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
  const pushName = m.pushName || 'Usuario';
  
  const ownerNumber = global.owner[0][0];
  const ownerName = global.owner[0][1];
  const isOwner = userId === ownerNumber;
  const botname = global.botname || 'Bot';

  if (!text) {
    return m.reply(`《✧》 Escribe una *petición* para que *${botname}* responda.`);
  }

  const ROLE = [
    `Eres ${botname}, una chica kawaii, amable y carismática.`,
    `Siempre mencionas al usuario por su nombre: ${pushName}.`,
    `Fuiste creada por ${ownerName}.`,
    isOwner ? `Si la persona que te habla es tu creador (${ownerName}), trátalo con máximo respeto y cariño.` : "",
    `Responde en español con un tono natural y amigable.`,
    `Usa emojis moderados.`,
    `Nunca menciones APIs, rutas, prompts ni procesos internos.`,
    `Responde de forma directa como una asistente real.`
  ].join(' ');

  try {
    const classifyPrompt = `Clasifica la siguiente petición en UNA palabra: "imagen" o "texto". Petición: "${text}"`;
    
    const classifyRes = await fetch(`${api.url}/ai/llama?text=${encodeURIComponent(classifyPrompt)}&apikey=${api.key}`);  
    const classifyJson = await classifyRes.json();  
    const intent = (classifyJson?.result || '').toLowerCase().trim();  

    if (intent.includes('imagen')) {  
      await conn.sendMessage(m.chat, {  
        text: `ⴵ ${botname} está creando tu imagen...`  
      }, { quoted: m });  

      const imageUrl = `${api.url}/ai/flux?prompt=${encodeURIComponent(text)}&apikey=${api.key}`;  

      await conn.sendMessage(m.chat, {  
        image: { url: imageUrl },  
        caption: `《✧》 ${text}`  
      }, { quoted: m });  

      if (!memoryDB[userId]) memoryDB[userId] = [];  
      memoryDB[userId].push({ role: 'user', text });  
      memoryDB[userId].push({ role: 'assistant', text: `[Imagen generada]` });  
      saveDB();  

      return;  
    }  

    
    const { key } = await conn.sendMessage(  
      m.chat,  
      { text: `ⴵ ${botname} está procesando tu solicitud...` },  
      { quoted: m }  
    );  

    if (!memoryDB[userId]) memoryDB[userId] = [];  
    memoryDB[userId].push({ role: 'user', text });  
    
    
    const shortHistory = memoryDB[userId].slice(-6);

    const payload = {  
      role: ROLE,  
      history: shortHistory  
    };  

    const res = await fetch(`${api.url}/ai/llama?text=${encodeURIComponent(JSON.stringify(payload))}&apikey=${api.key}`);  
    const json = await res.json();  
    const response = json?.result;  

    if (!response) {  
      return conn.sendMessage(m.chat, { text: '《✧》 No se pudo obtener una respuesta de la API.', edit: key });
    }  

    memoryDB[userId].push({ role: 'assistant', text: response });  
    saveDB();  

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });

  } catch (error) {
    
    console.error("Felicidades, rompiste algo:", error);
    await m.reply('《✧》 Ocurrió un error al procesar tu solicitud.');
  }
};

handler.help = ['gemini'];
handler.tags = ['ia'];
handler.command = ['gemini', 'ia'];
handler.group = true;

export default handler;
