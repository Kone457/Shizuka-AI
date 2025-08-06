import { delay } from '@whiskeysockets/baileys';

const propietarios = global.owner
  .flat()
  .filter(i => typeof i === 'string')
  .map(i => i.replace(/\D/g, '') + '@c.us');

const salasRuleta = {};

const handler = async (m, { conn }) => {
  const chatId = m.chat;
  const senderId = m.sender;

  if (salasRuleta[chatId]) 
    return conn.reply(m.chat, '☠️ 𓆩 Ya existe un círculo activo en este aquelarre. Espera a que el ritual concluya. 𓆪 ☠️', m);

  salasRuleta[chatId] = { jugadores: [senderId], estado: 'esperando' };

  await conn.sendMessage(m.chat, { 
    text: `༒︎ *Ruleta Infernal* ༒︎\n\n🜲 @${senderId.split('@')[0]} ha invocado el juego maldito.\n\n✶ Responde con *acepto* para sellar tu pacto. Tiempo: 60 segundos...`, 
    mentions: [senderId] 
  }, { quoted: m });

  await delay(60000);
  if (salasRuleta[chatId] && salasRuleta[chatId].estado === 'esperando') {
    delete salasRuleta[chatId];
    await conn.sendMessage(m.chat, { text: '✘ El ritual fue ignorado. El círculo se disuelve en sombras...' });
  }
};

handler.command = ['ruletainfernal'];
handler.botAdmin = true;

handler.before = async (m, { conn }) => {
  const chatId = m.chat;
  const senderId = m.sender;
  const texto = m.text?.toLowerCase();

  if (!salasRuleta[chatId]) return;

  if (texto === 'acepto' || texto === 'aceptar') {
    if (salasRuleta[chatId].jugadores.length >= 2) 
      return conn.reply(m.chat, '☠️ Ya hay dos almas atrapadas en este juego. No puedes entrar.', m);

    if (senderId === salasRuleta[chatId].jugadores[0])
      return conn.reply(m.chat, '✘ No puedes pactar contigo mismo, criatura.', m);

    salasRuleta[chatId].jugadores.push(senderId);
    salasRuleta[chatId].estado = 'completa';

    await conn.sendMessage(m.chat, { 
      audio: { url: "https://qu.ax/iwAmy.mp3" }, 
      mimetype: "audio/mp4", 
      ptt: true 
    });

    await conn.sendMessage(m.chat, { 
      text: '༒︎ *Ruleta Infernal* ༒︎\n\n⚰️ ¡Dos almas han sellado el pacto!\n\n✶ Invocando al azar demoníaco...' 
    });

    const loadingMessages = [
      "☠️ 《 █▒▒▒▒▒▒▒▒▒▒▒》10%\n- Invocando entidades oscuras...",
      "☠️ 《 ████▒▒▒▒▒▒▒▒》30%\n- El velo entre mundos se abre...",
      "☠️ 《 ███████▒▒▒▒▒》50%\n- El juicio se aproxima...",
      "☠️ 《 ██████████▒▒》80%\n- El abismo elige su víctima...",
      "☠️ 《 ████████████》100%\n- El veredicto ha sido sellado..."
    ];

    let { key } = await conn.sendMessage(m.chat, { text: "✶ El círculo está girando..." }, { quoted: m });

    for (let msg of loadingMessages) {
      await delay(3000);
      await conn.sendMessage(m.chat, { text: msg, edit: key }, { quoted: m });
    }

    const [jugador1, jugador2] = salasRuleta[chatId].jugadores;
    let perdedor = Math.random() < 0.5 ? jugador1 : jugador2;

    if (propietarios.includes(perdedor)) {
      await conn.sendMessage(m.chat, {
        text: '🜲 El abismo intentó devorar al creador... pero su esencia es eterna.',
        mentions: [perdedor]
      });
      perdedor = perdedor === jugador1 ? jugador2 : jugador1;
    }

    await conn.sendMessage(m.chat, { 
      text: `☠️ *Veredicto Infernal* ☠️\n\n@${perdedor.split('@')[0]} ha sido marcado por el destino.\n\n✶ Tiene 60 segundos para sus últimas palabras antes de morir...`, 
      mentions: [perdedor] 
    });

    await delay(60000);        
    await conn.groupParticipantsUpdate(m.chat, [perdedor], 'remove');
    await conn.sendMessage(m.chat, { 
      text: `✘ @${perdedor.split('@')[0]} ha muerto. El círculo se cierra con su sangre. 🕱`, 
      mentions: [perdedor] 
    });

    const epitafios = [
      "Su alma ha sido arrancada del código.",
      "El infierno lo reclama sin piedad.",
      "Su existencia ha sido borrada.",
      "Ni los demonios quisieron su esencia.",
      "El círculo se alimenta de su muerte."
    ];
    const epitafio = epitafios[Math.floor(Math.random() * epitafios.length)];
    await conn.sendMessage(m.chat, { text: `🕱 ${epitafio}` });

    delete salasRuleta[chatId];
  }

  if (texto === 'rechazar' && senderId === salasRuleta[chatId].jugadores[0]) {
    delete salasRuleta[chatId];
    await conn.sendMessage(m.chat, { text: '✘ El invocador ha roto el pacto. El juego se disuelve.' });
  }
};

export default handler;