import { getUser, getUserKey } from '../lib/userdb.js'
let marriages = globalThis.marriages || (globalThis.marriages = {});

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup)
    return m.reply('❌ الأمر ده للجروبات بس.');

  let mentioned = await m.mentionedJid;

  let who = mentioned.length > 0
    ? mentioned[0]
    : (m.quoted ? m.quoted.sender : false);

  if (!who) {
    return m.reply(
      `⚠️ لازم تعمل منشن للشخص اللي عايز تتجوزه`
    );
  }

  if (who === m.sender)
    return m.reply('❌ مش تقدر تتجوز نفسك.');

  if (who === conn.user.jid)
    return m.reply('❌ شكراً على الاهتمام، بس أنا متجوز الكود!');

  let user = getUser(globalThis.db.data.users, m.sender) || (globalThis.db.data.users[getUserKey(globalThis.db.data.users, m.sender)] = {});
  let target = getUser(globalThis.db.data.users, who) || (globalThis.db.data.users[getUserKey(globalThis.db.data.users, who)] = {});

  if (user.marry)
    return m.reply('⚠️ انت متجوز حد بالفعل.');

  if (target.marry)
    return m.reply('⚠️ الشخص ده متجوز بالفعل.');

  marriages[who] = {
    proposer: m.sender,
    chat: m.chat,
    time: Date.now()
  };

  await conn.sendMessage(
    m.chat,
    {
      text:
        `💍 *انتباه @${who.split('@')[0]}!*\n\n` +
        `@${m.sender.split('@')[0]} te ha propuesto matrimonio. 💐\n\n` +
        `رد على الرسالة دي بـ:\n` +
        `• *موافق* عشان تقبل 💍\n` +
        `• *مرفوض* عشان ترفض العرض 💔`,
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

  if (['acepto', 'si', 'sí', 'aceptar', 'موافق', 'موافقة', 'قبول', 'نعم'].includes(txt)) {
    let user = getUser(globalThis.db.data.users, proposal.proposer) || (globalThis.db.data.users[getUserKey(globalThis.db.data.users, proposal.proposer)] = {});
    let target = getUser(globalThis.db.data.users, who) || (globalThis.db.data.users[getUserKey(globalThis.db.data.users, who)] = {});

    user.marry = who;
    target.marry = proposal.proposer;

    delete marriages[who];

    await conn.sendMessage(
      m.chat,
      {
        text:
          `🎉💍 مبروك!\n\n` +
          `@${proposal.proposer.split('@')[0]} y ` +
          `@${who.split('@')[0]} اتجوزوا دلوقتي. 💐✨\n\n` +
          `ربنا يديم المحبة. 🥹💕`,
        contextInfo: {
          mentionedJid: [proposal.proposer, who],
          isForwarded: true
        }
      },
      { quoted: m }
    );

  } else if (
    ['rechazo', 'no', 'rechazar', 'مرفوض', 'رفض', 'لا'].includes(txt)
  ) {
    delete marriages[who];

    await conn.sendMessage(
      m.chat,
      {
        text:
          `💔 @${who.split('@')[0]} رفض عرض الجواز من` +
          `@${proposal.proposer.split('@')[0]}.\n\n` +
          `قصة حزينة... 🥀`,
        contextInfo: {
          mentionedJid: [who, proposal.proposer],
          isForwarded: true
        }
      },
      { quoted: m }
    );
  }
};

handler.help = ['زواج']
handler.tags = ['game']
handler.command = ['marry', 'casarse', 'matrimonio', 'زواج', 'اتجوز'];
handler.group = true;

export default handler;