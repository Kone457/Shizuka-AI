import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];
  const rawTarget = m.messageStubParameters?.[0];

  if (!rawTarget) return true;

  // Extraemos el número para el username de la API y para la mención (@user)
  const userNumber = rawTarget.split('@')[0].replace(/\D/g, '');

  // Extraemos el nombre real para mandarlo exclusivamente a la API
  let targetName = '';
  try {
    targetName = await conn.getName(rawTarget);
  } catch {}

  if (!targetName || targetName === rawTarget || targetName.includes('@s.whatsapp.net') || targetName.includes(userNumber)) {
    const contact = conn.store?.contacts?.[rawTarget] || conn.contacts?.[rawTarget] || {};
    targetName = contact.pushName || contact.notify || contact.name || contact.vname || globalThis.db.data.users?.[rawTarget]?.name || userNumber;
  }

  const avatarUrl = await conn.profilePictureUrl(rawTarget, 'image').catch(() => 'https://files.evogb.win/AGCG2d.jpg');

  const actor = m.participant || m.key?.participant || m.messageStubParameters?.[1] || null;
  let actorJid = actor;

  if (actorJid) {
    try {
      actorJid = conn.decodeJid(actorJid) || actorJid;
    } catch {}
  }

  let memberCount = participants.length;
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) memberCount++;
  if ([WAMessageStubType.GROUP_PARTICIPANT_REMOVE, WAMessageStubType.GROUP_PARTICIPANT_LEAVE].includes(m.messageStubType)) memberCount--;

  const actionText = {
    [WAMessageStubType.GROUP_PARTICIPANT_ADD]: actorJid ? `Agregado por @${actorJid.split('@')[0]}` : 'Se unió al grupo',
    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]: actorJid ? `Eliminado por @${actorJid.split('@')[0]}` : 'Eliminado del grupo',
    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]: 'Salió del grupo'
  };

  const format = text => {
    return text
      .replace('@user', `@${userNumber}`)
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

👤 Usuario: @user
🏷️ Grupo: @group

📌 @action

📜 Descripción del grupo:
@desc

👥 Miembro # %users
⚠️ Lee las reglas para evitar BAN.

╔═══❖•°•°•°❖•°•°•°❖═══╗
✦ 𝐃𝐈𝐒𝐅𝐑𝐔𝐓𝐀 𝐓𝐔 𝐄𝐒𝐓𝐀𝐃𝐈𝐀 ✦
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim());

  const bye = format(`
╔═══❖•°•°•°❖•°•°•°❖═══╗
💔 𝐇𝐀𝐒𝐓𝐀 𝐏𝐑𝐎𝐍𝐓𝐎 💔
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 Usuario: @user
🏷️ Grupo: @group

📌 @action

😢 Esperamos que vuelvas pronto...
👥 Miembros ahora: %users

╔═══❖•°•°•°❖•°•°•°❖═══╗
✦ 𝐕𝐔𝐄𝐋𝐕𝐄 𝐂𝐔𝐀𝐍𝐃𝐎 𝐐𝐔𝐈𝐄𝐑𝐀𝐒 ✦
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim());

  const mentions = [rawTarget];
  if (actorJid && !mentions.includes(actorJid)) mentions.push(actorJid);

  const context = {
    contextInfo: {
      mentionedJid: mentions,
      isForwarded: true
    }
  };

  const apiParams = global.api || globalThis.api || { url: '', key: '' };

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const url =
      `${apiParams.url}/welcome` +
      `?name=${encodeURIComponent(targetName)}` +
      `&username=${encodeURIComponent(userNumber)}` +
      `&group=${encodeURIComponent(groupMetadata.subject)}` +
      `&userImage=${encodeURIComponent(avatarUrl)}` +
      `&welcomeImage=https://files.evogb.win/SxLysS.jpg` +
      `&apikey=${apiParams.key}`;

    await conn.sendMessage(m.chat, { image: { url }, caption: welcome, ...context });
  }

  if (chat.welcome && [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType)) {
    const url =
      `${apiParams.url}/welcome` +
      `?name=${encodeURIComponent(targetName)}` +
      `&username=${encodeURIComponent(userNumber)}` +
      `&group=${encodeURIComponent(groupMetadata.subject)}` +
      `&userImage=${encodeURIComponent(avatarUrl)}` +
      `&welcomeImage=https://files.evogb.win/dlaamr.jpg` +
      `&apikey=${apiParams.key}`;

    await conn.sendMessage(m.chat, { image: { url }, caption: bye, ...context });
  }
}
