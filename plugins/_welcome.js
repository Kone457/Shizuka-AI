import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];
  const userss = m.messageStubParameters?.[0];
  if (!userss) return true;

  const nombre = globalThis.db.data.users[userss]?.name || {};
  const name = nombre || await conn.getName(userss);

  const ppUrl = await conn.profilePictureUrl(userss, 'image')
    .catch(() => 'https://files.catbox.moe/l91dnk.jpg');

  let memberCount = participants.length;
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) memberCount += 1;
  else if ([WAMessageStubType.GROUP_PARTICIPANT_REMOVE, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) memberCount -= 1;

  const mentions = [userss, m.key.participant].filter(Boolean);
  const fakeContext = { contextInfo: { mentionedJid: mentions } };

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const background = encodeURIComponent('https://cdn.popcat.xyz/welcome-bg.png');
    const text1 = encodeURIComponent('');
    const text2 = encodeURIComponent(`Bienvenido a ${groupMetadata.subject}`);
    const text3 = encodeURIComponent(`Ahora somos ${memberCount} miembros`);
    const avatar = encodeURIComponent(ppUrl);

    const popcatUrl = `https://api.popcat.xyz/v2/welcomecard?background=${background}&text1=${text1}&text2=${text2}&text3=${text3}&avatar=${avatar}`;

    await conn.sendMessage(
      m.chat,
      { image: { url: popcatUrl }, caption: `🌸 Bienvenido @${userss.split('@')[0]}!\n👥 Ahora somos ${memberCount} miembros.`, ...fakeContext }
    );
  }

  if (chat.welcome && [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType)) {
    const background = encodeURIComponent('https://cdn.popcat.xyz/welcome-bg.png');
    const text1 = encodeURIComponent('');
    const text2 = encodeURIComponent(`Hasta pronto desde ${groupMetadata.subject}`);
    const text3 = encodeURIComponent(`Ahora somos ${memberCount} miembros`);
    const avatar = encodeURIComponent(ppUrl);

    const popcatUrl = `https://api.popcat.xyz/v2/welcomecard?background=${background}&text1=${text1}&text2=${text2}&text3=${text3}&avatar=${avatar}`;

    await conn.sendMessage(
      m.chat,
      { image: { url: popcatUrl }, caption: `👋 Hasta pronto @${userss.split('@')[0]}!\n👥 Ahora somos ${memberCount} miembros.`, ...fakeContext }
    );
  }

  return true;
}