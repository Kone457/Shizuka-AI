import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];

  const target = m.messageStubParameters?.[0];
  if (!target) return true;

  const userData = globalThis.db.data.users[target] || {};
  const targetName = userData.name || await conn.getName(target) || `@${target.split('@')[0]}`;

  const ppUrl = await conn.profilePictureUrl(target, 'image')
    .catch(() => 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Datos/IMG-20260422-WA0136.jpg');

  const actor = m.participant || m.key.participant || m.messageStubParameters?.[1] || null;

  let memberCount = participants.length;
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) memberCount++;
  if ([WAMessageStubType.GROUP_PARTICIPANT_REMOVE, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) memberCount--;

  const actionText = {
    [WAMessageStubType.GROUP_PARTICIPANT_ADD]:
      actor ? `Agregado por @${actor.split('@')[0]}` : 'Se unió al grupo',

    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]:
      actor ? `Eliminado por @${actor.split('@')[0]}` : 'Eliminado del grupo',

    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]:
      'Salió del grupo'
  };

  const format = (text) => {
    return text
      .replace('@user', `@${target.split('@')[0]}`)
      .replace('@name', targetName)
      .replace('@group', groupMetadata.subject)
      .replace('@desc', groupMetadata.desc?.toString() || 'Sin descripción')
      .replace('%users', memberCount)
      .replace('@action', actionText[m.messageStubType] || '')
      .replace('@date', new Date().toLocaleString());
  };

  const welcome = format(`
╔═══❖•°•°•°❖•°•°•°❖═══╗
     🌟 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎 🌟
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 *Usuario:* @name
🏷️ *Grupo:* @group

📌 @action

📜 *Descripción del grupo:*
@desc

👥 *Miembro #* %users
⚠️ *Lee las reglas para evitar BAN.*

╔═══❖•°•°•°❖•°•°•°❖═══╗
     ✦ 𝐃𝐈𝐒𝐅𝐑𝐔𝐓𝐀 𝐓𝐔 𝐄𝐒𝐓𝐀𝐃𝐈𝐀 ✦
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim());

  const bye = format(`
╔═══❖•°•°•°❖•°•°•°❖═══╗
     💔 𝐇𝐀𝐒𝐓𝐀 𝐏𝐑𝐎𝐍𝐓𝐎 💔
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 *Usuario:* @name
🏷️ *Grupo:* @group

📌 @action

😢 Esperamos que vuelvas pronto...
👥 *Miembros ahora:* %users

╔═══❖•°•°•°❖•°•°•°❖═══╗
     ✦ 𝐕𝐔𝐄𝐋𝐕𝐄 𝐂𝐔𝐀𝐍𝐃𝐎 𝐐𝐔𝐈𝐄𝐑𝐀𝐒 ✦
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim());

  const mentions = [target];
  if (actor) mentions.push(actor);

  const context = {
    contextInfo: {
      mentionedJid: mentions,
      isForwarded: true,
      externalAdReply: {
        title: namebot || '',
        body: dev || '',
        thumbnailUrl: icon || ppUrl,
        sourceUrl: redes || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  };

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    await conn.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption: welcome,
      ...context
    });
  }

  if (chat.welcome && [
    WAMessageStubType.GROUP_PARTICIPANT_LEAVE,
    WAMessageStubType.GROUP_PARTICIPANT_REMOVE
  ].includes(m.messageStubType)) {
    await conn.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption: bye,
      ...context
    });
  }
}