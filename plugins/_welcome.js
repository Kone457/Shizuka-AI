
import { WAMessageStubType } from '@whiskeysockets/baileys';
import knights from '@clayzaaubert/canvix';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];
  const userss = m.messageStubParameters[0];

  // Datos básicos del usuario
  const nombre = globalThis.db.data.users[userss]?.name || {};
  const ppUrl = await conn.profilePictureUrl(userss, 'image')
    .catch(() => "https://files.catbox.moe/l91dnk.jpg");

  const name = nombre || await conn.getName(userss);
  const actionUser = m.key.participant ? await conn.getName(m.key.participant) : null;

  const actionMessages = {
    [WAMessageStubType.GROUP_PARTICIPANT_ADD]: actionUser ? `\n┊✨ *Agregado por ›* @${m.key.participant.split`@`[0]}` : '',
    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]: actionUser ? `\n┊⚠️ *Eliminado por ›* @${m.key.participant.split`@`[0]}` : '',
    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]: '┊👋 *Se fue por decisión propia*'
  };

  // Conteo de miembros
  let memberCount = participants.length;
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) memberCount += 1;
  else if ([WAMessageStubType.GROUP_PARTICIPANT_REMOVE, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) memberCount -= 1;

  // Plantillas de texto
  const welcomeMessage = chat.sWelcome || `\n
╔═══✦ Bienvenido ✦═══╗
🌸 Usuario: @user
🏠 Grupo: @group
📅 Fecha: @date
─────────────────────
✨ Usa /menu para ver los comandos.
👥 Ahora somos @users miembros.
╚═══════════════════╝`;

  const byeMessage = chat.sBye || `\n
╔═══✦ Hasta pronto ✦═══╗
🌸 Usuario: @user
📅 Fecha: @date
─────────────────────
💫 Esperamos que regrese pronto.
👥 Ahora somos @users miembros.
╚═══════════════════╝`;

  const formatText = (template) => {
    return template
      .replace('@user', `@${userss.split`@`[0]}`)
      .replace('@group', groupMetadata.subject)
      .replace('@date', new Date().toLocaleString())
      .replace('@users', `${memberCount}`)
      .replace('@type', actionMessages[m.messageStubType])
      .replace('@desc', groupMetadata.desc?.toString() || '✿ Sin descripción ✿');
  };

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

  // === Bienvenida con Canvix ===
  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    try {
      const image = await new knights.Welcome2()
        .setAvatar(ppUrl) // avatar del nuevo usuario
        .setUsername(name) // nombre del usuario
        .setBg("https://files.catbox.moe/yourbackground.jpg") // fondo personalizado
        .setGroupname(groupMetadata.subject) // nombre del grupo
        .setMember(memberCount.toString()) // número de miembros
        .toAttachment();

      const buffer = image.toBuffer();

      await conn.sendMessage(
        m.chat,
        { image: buffer, caption: formatText(welcomeMessage), ...fakeContext }
      );
    } catch (e) {
      // fallback si falla canvix
      await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: formatText(welcomeMessage), ...fakeContext });
    }
  }

  // === Despedida (sin Canvix, solo foto) ===
  if (chat.welcome && [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType)) {
    await conn.sendMessage(m.chat, { image: { url: ppUrl }, caption: formatText(byeMessage), ...fakeContext });
  }
}