import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];
  const nombre = globalThis.db.data.users[m.messageStubParameters[0]]?.name || {};
  const ppUrl = await conn.profilePictureUrl(m.messageStubParameters[0], 'image')
    .catch(() => "https://files.catbox.moe/l91dnk.jpg");

  const name = nombre || await conn.getName(m.messageStubParameters[0]);
  const actionUser = m.key.participant ? await conn.getName(m.key.participant) : null;

  const actionMessages = {
    [WAMessageStubType.GROUP_PARTICIPANT_ADD]: actionUser ? `\n┊✨ *Agregado por ›* @${m.key.participant.split`@`[0]}` : '',
    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]: actionUser ? `\n┊⚠️ *Eliminado por ›* @${m.key.participant.split`@`[0]}` : '',
    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]: '┊👋 *Se fue por decisión propia*'
  };

  const userss = m.messageStubParameters[0];
  const formatText = (template, memberCount) => {
    return template
      .replace('@user', `@${userss.split`@`[0]}`)
      .replace('@group', groupMetadata.subject)
      .replace('@date', new Date().toLocaleString())
      .replace('@users', `${memberCount}`)
      .replace('@type', actionMessages[m.messageStubType])
      .replace('@desc', groupMetadata.desc?.toString() || '✿ Sin descripción ✿');
  };

  let memberCount = participants.length;
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) memberCount += 1;
  else if ([WAMessageStubType.GROUP_PARTICIPANT_REMOVE, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) memberCount -= 1;

  const welcomeMessage = formatText(chat.sWelcome || `\n
╔═══✦ Bienvenido ✦═══╗
🌸 Usuario: @user
🏠 Grupo: @group
📅 Fecha: @date
─────────────────────
✨ Usa /menu para ver los comandos.
👥 Ahora somos @users miembros.
╚═══════════════════╝`, memberCount);

  const byeMessage = formatText(chat.sBye || `\n
╔═══✦ Hasta pronto ✦═══╗
🌸 Usuario: @user
📅 Fecha: @date
─────────────────────
💫 Esperamos que regrese pronto.
👥 Ahora somos @users miembros.
╚═══════════════════╝`, memberCount);

  const mentions = [userss, m.key.participant];

  const fakeContext = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363400241973967@newsletter",
        serverMessageId: '',
        newsletterName: "𝙎𝙝𝙞𝙯𝙪𝙠𝙖-𝘼𝙄 𝘾𝙝𝙖𝙣𝙣𝙚𝙡"
      },
      externalAdReply: {
        title: '✧ รɧıʑนʞศ-ศı ✧',
        body: 'Sistema de avisos del grupo',
        thumbnailUrl: "https://files.catbox.moe/l91dnk.jpg",
        mediaType: 1,
        renderLargerThumbnail: false
      },
      mentionedJid: mentions
    }
  };

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: welcomeMessage, ...fakeContext });
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
    await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: byeMessage, ...fakeContext });
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: byeMessage, ...fakeContext });
  }
}