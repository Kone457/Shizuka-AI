const handler = async (m, { conn }) => {
  const num = () => Math.floor(Math.random() * 50) + 10;
  const a = num(), b = num(), c = num();

  const correct = (a * b) + c;
  const wrong1 = correct + (Math.floor(Math.random() * 15) + 5);
  const wrong2 = correct - (Math.floor(Math.random() * 15) + 5);

  const options = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);

  const info = `
˚∩　ׅ　🅔𝖈𝗎𝖺𝖼𝗂𝗈𝗇 𝖉𝗂𝖿𝗂𝖼𝗂𝗅　ׄᰙ　ׅ

> ✨ Resuelve: (*${a} × ${b}*) + ${c}

𖣣ֶㅤ֯⌗ A › *${options[0]}*
𖣣ֶㅤ֯⌗ B › *${options[1]}*
𖣣ֶㅤ֯⌗ C › *${options[2]}*

⏳ Tienes *1 minuto* para responder.
`.trim();

  // Guardamos estado del juego en memoria temporal
  conn.mathGame = {
    chat: m.chat,
    correct,
    answered: false
  };

  await conn.sendMessage(m.chat, {
    text: info,
    footer: 'Selecciona tu respuesta:',
    buttons: [
      { buttonId: `eq_${options[0]}_${correct}`, buttonText: { displayText: 'A' }, type: 1 },
      { buttonId: `eq_${options[1]}_${correct}`, buttonText: { displayText: 'B' }, type: 1 },
      { buttonId: `eq_${options[2]}_${correct}`, buttonText: { displayText: 'C' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m });

  // Timer de 1 minuto: solo avisa si no se respondió
  setTimeout(async () => {
    if (conn.mathGame && !conn.mathGame.answered && conn.mathGame.chat === m.chat) {
      await conn.sendMessage(m.chat, { text: '⌛ Se acabó el tiempo. La respuesta correcta era *' + correct + '*.' });
      conn.mathGame = null;
    }
  }, 60 * 1000);
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  if (id.startsWith('eq_') && conn.mathGame && conn.mathGame.chat === m.chat) {
    const [_, chosen, correct] = id.split('_');
    conn.mathGame.answered = true; // marcamos que ya respondió

    if (parseInt(chosen) === parseInt(correct)) {
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      m.reply(`🎉 ¡Correcto! ${chosen} es la respuesta.`);
    } else {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      m.reply(`❌ Incorrecto. La respuesta era *${correct}*.`);
    }

    conn.mathGame = null; // limpiamos estado
  }
};

handler.command = ['calcular'];
handler.tags = ['fun'];
handler.help = ['calcular'];

export default handler;