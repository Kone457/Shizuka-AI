import { delay } from '@whiskeysockets/baileys';

// Extraer propietarios desde global.owner
const propietarios = global.owner
  .flat()
  .filter(i => typeof i === 'string')
  .map(i => i.replace(/\D/g, '') + '@c.us');

const salasRuleta = {};

const handler = async (m, { conn }) => {
  const chatId = m.chat;
  const senderId = m.sender;

  if (salasRuleta[chatId]) 
    return conn.reply(m.chat, '☠️ Ya hay una sala activa en este grupo. El ritual debe completarse antes de invocar otro.', m);

  salasRuleta[chatId] = { jugadores: [senderId], estado: 'esperando' };

  await conn.sendMessage(m.chat, { 
    text: `☠️ *Ruleta Infernal* ☠️\n\n@${senderId.split('@')[0]} ha invocado el juego prohibido.\n🩸 Responde con *acepto* si tienes el valor de enfrentar al destino.\nTiempo restante: 60 segundos...`, 
    mentions: [senderId] 
  }, { quoted: m });

  await delay(60000);
  if (salasRuleta[chatId] && salasRuleta[chatId].estado === 'esperando') {
    delete salasRuleta[chatId];
    await conn.sendMessage(m.chat, { text: '☠️ Nadie aceptó el pacto. El círculo se disuelve en silencio...' });
  }
};

handler.command = ['ruletamuerte'];
handler.botAdmin = true;

handler.before = async (m, { conn }) => {
  const chatId = m.chat;
  const senderId = m.sender;
  const texto = m.text?.toLowerCase();

  if (!salasRuleta[chatId]) return;

  if (texto === 'acepto' || texto === 'aceptar') {
    if (salasRuleta[chatId].jugadores.length >= 2) 
      return conn.reply(m.chat, '☠️ El círculo ya está completo. No se admiten más almas.', m);

    if (senderId === salasRuleta[chatId].jugadores[0])
      return conn.reply(m.chat, '☠️ No puedes aceptar tu propio pacto.', m);

    salasRuleta[chatId].jugadores.push(senderId);
    salasRuleta[chatId].estado = 'completa';

    await conn.sendMessage(m.chat, { 
      audio: { url: "https://qu.ax/iwAmy.mp3" }, 
      mimetype: "audio/mp4", 
      ptt: true 
    });

    await conn.sendMessage(m.chat, { 
      text: '☠️ *Ruleta Infernal* ☠️\n\n🩸 ¡Dos almas han sido selladas!\n🔮 Invocando el juicio del abismo...' 
    });

    const loadingMessages = [
      "《 █▒▒▒▒▒▒▒▒▒▒▒》10%\n- Los espíritus comienzan a murmurar...",
      "《 ████▒▒▒▒▒▒▒▒》30%\n- El círculo se enciende con fuego oscuro...",
      "《 ███████▒▒▒▒▒》50%\n- El sacrificio está cerca...",
      "《 ██████████▒▒》80%\n- El abismo elige a su víctima...",
      "《 ████████████》100%\n- El veredicto ha sido sellado con sangre."
    ];

    let { key } = await conn.sendMessage(m.chat, { text: "☠️ Invocando el destino oscuro..." }, { quoted: m });

    for (let msg of loadingMessages) {
      await delay(3000);
      await conn.sendMessage(m.chat, { text: msg, edit: key }, { quoted: m });
    }

    const [jugador1, jugador2] = salasRuleta[chatId].jugadores;
    let perdedor = Math.random() < 0.5 ? jugador1 : jugador2;

    if (propietarios.includes(perdedor)) {
      await conn.sendMessage(m.chat, {
        text: '⚡ El abismo intentó devorar al creador… pero su esencia es eterna.',
        mentions: [perdedor]
      });
      perdedor = perdedor === jugador1 ? jugador2 : jugador1;
    }

    await conn.sendMessage(m.chat, { 
      text: `☠️ *Veredicto Infernal* ☠️\n\n@${perdedor.split('@')[0]} ha sido marcado por el abismo.\n🩸 Tiene 60 segundos para sus últimas palabras...`, 
      mentions: [perdedor] 
    });

    await delay(60000);        
    await conn.groupParticipantsUpdate(m.chat, [perdedor], 'remove');
    await conn.sendMessage(m.chat, { 
      text: `🩸 @${perdedor.split('@')[0]} ha sido devorado por las sombras.\n☠️ El juego ha terminado.`, 
      mentions: [perdedor] 
    });        
    delete salasRuleta[chatId];
  }

  if (texto === 'rechazar' && senderId === salasRuleta[chatId].jugadores[0]) {
    delete salasRuleta[chatId];
    await conn.sendMessage(m.chat, { text: '☠️ El retador ha roto el pacto. El juego ha sido cancelado.' });
  }
};

export default handler;