var handler = async (m, { conn, participants, usedPrefix, command }) => {
  let texto = await m.mentionedJid;
  let user = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false);

  if (!user) {
    return conn.reply(m.chat, 
      `*Etiqueta a alguien, mi rey 👀.*`, 
      m
    );
  }

  const frases = [
    'me niego rotundamente a advertir a',
    'no pienso hacerle nada a',
    'me resisto completamente a advertir a',
    'no quiero advertir a',
    'no puedo advertir a',
    'no me da la gana advertir a',
    'hoy no advierto a',
    'no estoy autorizado para advertir a'
  ];

  const frase = frases[Math.floor(Math.random() * frases.length)];

  const textoFinal = `
╭─ׅ─ׅ┈ ─๋︩︪─⚠️─๋︩︪─┈─ׅ─ׅ╮
├ׁ̟̇❍✎ ${frase} @${user.split('@')[0]}
├ׁ̟̇❍✎ 😤 ¡Yo no hago bullying!
╰─ׅ─ׅ┈ ─๋︩︪─⚠️─๋︩︪─┈─ׅ─ׅ╯`.trim();

  await conn.sendMessage(m.chat, { 
    text: textoFinal, 
    mentions: [user] 
  }, { quoted: m });
};

handler.help = ['warn'];
handler.tags = ['fun'];
handler.command = ['warn'];

export default handler;