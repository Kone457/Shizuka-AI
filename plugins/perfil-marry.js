let marriages = globalThis.marriages || (globalThis.marriages = {});

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup)
    return m.reply('❌ Este comando solo se puede usar en grupos.');

  let mentioned = await m.mentionedJid;

  let who = mentioned.length > 0
    ? mentioned[0]
    : (m.quoted ? m.quoted.sender : false);

  if (!who) {
    return m.reply(
      `⚠️ Debes etiquetar a la persona con la que deseas casarte`
    );
  }

  if (who === m.sender)
    return m.reply('❌ No puedes casarte contigo mismo/a.');

  if (who === conn.user.jid)
    return m.reply('❌ ¡Muchas gracias por el detalle, pero estoy casado con el código!');

  let user = globalThis.db.data.users[m.sender] ||= {};
  let target = globalThis.db.data.users[who] ||= {};

  if (user.marry)
    return m.reply('⚠️ Ya estás casado/a con otra persona.');

  if (target.marry)
    return m.reply('⚠️ Esa persona ya está casada.');

  marriages[who] = {
    proposer: m.sender,
    chat: m.chat,
    time: Date.now()
  };

  await conn.sendMessage(
    m.chat,
    {
      text:
        `💍 ¡Atención @${who.split('@')[0]}!\n\n` +
        `@${m.sender.split('@')[0]} te ha propuesto matrimonio. 💐\n\n` +
        `Responde a este mensaje con:\n` +
        `• *acepto* para dar el "Sí, acepto" 💍\n` +
        `• *rechazo* para rechazar la propuesta 💔`,
      contextInfo: {
        mentionedJid: [who, m.sender],
        isForwarded: true
      }
    },
    { quoted: m }
  );
};

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.text) return;

  let who = m.sender;

  if (!marriages[who]) return;

  let proposal = marriages[who];

  if (proposal.chat !== m.chat) return;

  let txt = m.text.trim().toLowerCase();

  if (txt === 'acepto' || txt === 'si' || txt === 'sí' || txt === 'aceptar') {
    let user = globalThis.db.data.users[proposal.proposer] ||= {};
    let target = globalThis.db.data.users[who] ||= {};

    user.marry = who;
    target.marry = proposal.proposer;

    delete marriages[who];

    await conn.sendMessage(
      m.chat,
      {
        text:
          `🎉💍 ¡Felicidades!\n\n` +
          `@${proposal.proposer.split('@')[0]} y ` +
          `@${who.split('@')[0]} acaban de unirse en matrimonio. 💐✨\n\n` +
          `Que su amor dure para siempre. 🥹💕`,
        contextInfo: {
          mentionedJid: [proposal.proposer, who],
          isForwarded: true
        }
      },
      { quoted: m }
    );

  } else if (
    txt === 'rechazo' ||
    txt === 'no' ||
    txt === 'rechazar'
  ) {
    delete marriages[who];

    await conn.sendMessage(
      m.chat,
      {
        text:
          `💔 @${who.split('@')[0]} ha rechazado la propuesta de matrimonio de ` +
          `@${proposal.proposer.split('@')[0]}.\n\n` +
          `Qué triste historia... 🥀`,
        contextInfo: {
          mentionedJid: [who, proposal.proposer],
          isForwarded: true
        }
      },
      { quoted: m }
    );
  }
};

handler.command = ['marry', 'casarse', 'matrimonio'];
handler.group = true;

export default handler;