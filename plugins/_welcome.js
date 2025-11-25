import { WAMessageStubType } from '@whiskeysockets/baileys';
import knights from '@clayzaaubert/canvix';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];
  const userss = m.messageStubParameters?.[0];
  if (!userss) return true;

  const nombre = globalThis.db.data.users[userss]?.name || {};
  const name = nombre || await conn.getName(userss);

  // Perfil (fallback de URL estable)
  const ppUrl = await conn.profilePictureUrl(userss, 'image')
    .catch(() => 'https://files.catbox.moe/l91dnk.jpg');

  // Conteo de miembros
  let memberCount = participants.length;
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) memberCount += 1;
  else if ([WAMessageStubType.GROUP_PARTICIPANT_REMOVE, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) memberCount -= 1;

  const welcomeTpl = chat.sWelcome || `\n
╔═══✦ Bienvenido ✦═══╗
🌸 Usuario: @user
🏠 Grupo: @group
📅 Fecha: @date
─────────────────────
✨ Usa /menu para ver los comandos.
👥 Ahora somos @users miembros.
╚═══════════════════╝`;

  const byeTpl = chat.sBye || `\n
╔═══✦ Hasta pronto ✦═══╗
🌸 Usuario: @user
📅 Fecha: @date
─────────────────────
💫 Esperamos que regrese pronto.
👥 Ahora somos @users miembros.
╚═══════════════════╝`;

  const actionUser = m.key.participant ? await conn.getName(m.key.participant) : null;
  const actionMessages = {
    [WAMessageStubType.GROUP_PARTICIPANT_ADD]: actionUser ? `\n┊✨ *Agregado por ›* @${m.key.participant.split('@')[0]}` : '',
    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]: actionUser ? `\n┊⚠️ *Eliminado por ›* @${m.key.participant.split('@')[0]}` : '',
    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]: '┊👋 *Se fue por decisión propia*'
  };

  const formatText = (template) =>
    template
      .replace('@user', `@${userss.split('@')[0]}`)
      .replace('@group', groupMetadata.subject)
      .replace('@date', new Date().toLocaleString())
      .replace('@users', `${memberCount}`)
      .replace('@type', actionMessages[m.messageStubType] || '')
      .replace('@desc', groupMetadata.desc?.toString() || '✿ Sin descripción ✿');

  const fakeContext = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363400241973967@newsletter',
        serverMessageId: '',
        newsletterName: '𝙎𝙝𝙞𝙯𝙪𝙠𝙖-𝘼𝙄 𝘾𝙝𝙖𝙣𝙣𝙚𝙡'
      },
      externalAdReply: {
        title: '✧ รɧıʑนʞศ-ศı ✧',
        body: 'Sistema de avisos del grupo',
        thumbnailUrl: 'https://files.catbox.moe/l91dnk.jpg',
        mediaType: 1,
        renderLargerThumbnail: false
      },
      mentionedJid: [userss, m.key.participant].filter(Boolean)
    }
  };

  // Bienvenida con Canvix
  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    try {
      const attachment = await new knights.Welcome2()
        .setAvatar(ppUrl)                  // avatar del nuevo usuario
        .setUsername(String(name || 'Miembro')) 
        .setBg('https://files.catbox.moe/9q6n9o.png') // fondo ceremonial
        .setGroupname(groupMetadata.subject)
        .setMember(String(memberCount))
        .toAttachment();

      const buffer = attachment.toBuffer();

      await conn.sendMessage(
        m.chat,
        { image: buffer, caption: formatText(welcomeTpl), ...fakeContext }
      );
    } catch (err) {
      // fallback si falla canvix
      await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: formatText(welcomeTpl), ...fakeContext });
    }
  }

  // Despedida simple (foto de perfil)
  if (chat.welcome && [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType)) {
    await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: formatText(byeTpl), ...fakeContext });
  }

  return true;
}