const handler = async (m, { conn }) => {
  // Generamos ecuaciones difíciles con operadores aleatorios
  const num = () => Math.floor(Math.random() * 50) + 10; // números entre 10 y 60
  const a = num(), b = num(), c = num();

  // Creamos una ecuación tipo (a * b) + c
  const correct = (a * b) + c;

  // Variantes falsas cercanas
  const wrong1 = correct + (Math.floor(Math.random() * 15) + 5);
  const wrong2 = correct - (Math.floor(Math.random() * 15) + 5);

  // Mezclamos opciones
  const options = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);

  const info = `
˚∩　ׅ　🅔𝖈𝗎𝖺𝖼𝗂𝗈𝗇 𝖉𝗂𝖿𝗂𝖼𝗂𝗅　ׄᰙ　ׅ

> ✨ Resuelve: (*${a} × ${b}*) + ${c}

𖣣ֶㅤ֯⌗ A › *${options[0]}*
𖣣ֶㅤ֯⌗ B › *${options[1]}*
𖣣ֶㅤ֯⌗ C › *${options[2]}*

⏳ Tienes *1 minuto* para responder.
`.trim();

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

  // Timer de 1 minuto
  setTimeout(async () => {
    await conn.sendMessage(m.chat, { text: '⌛ Se acabó el tiempo. La respuesta correcta era *' + correct + '*.' });
  }, 60 * 1000);
};

handler.before = async (m, { conn }) => {
  const id = m.message?.buttonsResponseMessage?.selectedButtonId;
  if (!id) return;

  if (id.startsWith('eq_')) {
    const [_, chosen, correct] = id.split('_');
    if (parseInt(chosen) === parseInt(correct)) {
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      m.reply(`🎉 ¡Correcto! ${chosen} es la respuesta.`);
    } else {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      m.reply(`❌ Incorrecto. La respuesta era *${correct}*.`);
    }
  }
};

handler.command = ['calcular'];
handler.tags = ['fun'];
handler.help = ['calcular'];

export default handler;