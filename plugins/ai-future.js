import fetch from 'node-fetch';

const memoryStore = new Map();

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('《✧》 Escribe una *petición* para que *Oscar* te responda.');
  }

  const userId = m.sender;
  
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, {
      history: [],
      lastInteraction: Date.now()
    });
  }
  
  const userMemory = memoryStore.get(userId);
  
  if (Date.now() - userMemory.lastInteraction > 1800000) {
    userMemory.history = [];
    userMemory.lastInteraction = Date.now();
  }

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: 'ⴵ *Oscar* está procesando tu solicitud...' },
      { quoted: m }
    );

    const historyContext = userMemory.history.slice(-5);
    let promptWithContext = text;
    
    if (historyContext.length > 0) {
      const contextString = historyContext.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n');
      promptWithContext = `Contexto de conversación:\n${contextString}\n\nUsuario: ${text}`;
    }

    const res = await fetch(`${api.url}/ai/oscar?text=${encodeURIComponent(promptWithContext)}&apikey=${api.key}`);
    const json = await res.json();

    const response = json?.result;

    if (!response) {
      return conn.reply(m.chat, '❏ No se pudo obtener una *respuesta* válida.');
    }

    userMemory.history.push(
      { role: 'usuario', content: text },
      { role: 'asistente', content: response }
    );
    
    if (userMemory.history.length > 20) {
      userMemory.history = userMemory.history.slice(-20);
    }
    
    userMemory.lastInteraction = Date.now();

    await conn.sendMessage(m.chat, { text: response.trim(), edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('❏ Ocurrió un error al procesar tu solicitud.');
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of memoryStore.entries()) {
    if (now - data.lastInteraction > 3600000) {
      memoryStore.delete(userId);
    }
  }
}, 3600000);

handler.help = ['oscar'];
handler.tags = ['ia'];
handler.command = ['oscar'];

export default handler;