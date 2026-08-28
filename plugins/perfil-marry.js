let marriages = globalThis.marriages || (globalThis.marriages = {});

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.');

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  if (!who) return m.reply(`⚠️ Debes etiquetar a la persona con la que deseas casarte.\n\nEjemplo:\n${usedPrefix + command} @usuario`);

  if (who === m.sender) return m.reply('❌ No puedes casarte contigo mismo/a.');
  if (who === conn.user.jid) return m.reply('❌ ¡Muchas gracias por el detalle, pero estoy casado con el código!');

  let user = globalThis.db.data.users[m.sender] ||= {};
  let target = globalThis.db.data.users[who] ||= {};

  if (user.marry) return m.reply('⚠️ Ya estás casado/a con otra persona.');
  if (target.marry) return m.reply('⚠️ Esa persona ya está casada.');

  marriages[who] = {
    proposer: m.sender,
    chat: m.chat,
    time: Date.now()
  };

  await conn.sendMessage(m.chat, {
    text: `💍 ¡Atención @${who.split('@')[0]}!\n\n@${m.sender.split('@')[0]} te ha propuesto matrimonio.\n\nResponde a este mensaje con:\n• *acepto* para dar el "Sí, acepto"\n• *rechazo* para rechazar la propuesta`,
    contextInfo: { mentionedJid: [who, m.sender], isForwarded: true }
  }, { quoted: m });
};

handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.text) return;

  let who = m.sender;
  if (!marriages[who]) return;

  let proposal = marriages[who];
  if (proposal.chat !== m.chat) return;

  let txt = m.text.trim().toLowerCase();

  if (txt === 'acepto' || txt === 'si' || txt === 'aceptar') {
    let user = globalThis.db.data.users[proposal.proposer];
    let target = globalThis.db.data.users[who];

    user.marry = who;
    target.marry = proposal.proposer;

    delete marriages[who];

    await conn.sendMessage(m.chat, {
      text: `🎉 ¡Felicidades! @${proposal.proposer.split('@')[0]} y @${who.split('@')[0]} acaban de unirse en matrimonio. 💍✨`,
      contextInfo: { mentionedJid: [proposal.proposer, who], isForwarded: true }
    }, { quoted: m });
  } else if (txt === 'rechazo' || txt === 'no' || txt === 'rechazar') {
    delete marriages[who];

    await conn.sendMessage(m.chat, {
      text: `💔 @${who.split('@')[0]} ha rechazado la propuesta de matrimonio de @${proposal.proposer.split('@')[0]}. Qué triste historia... 🥀`,
      contextInfo: { mentionedJid: [who, proposal.proposer], isForwarded: true }
    }, { quoted: m });
  }
};

handler.command = ['marry', 'casarse', 'matrimonio'];
export default handler;
