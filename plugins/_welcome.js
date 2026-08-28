import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chat = globalThis.db?.data?.chats?.[m.chat];
  if (!chat) return;

  const rawTarget = m.messageStubParameters?.[0];
  if (!rawTarget) return;

  let target = rawTarget;

  try {
    if (typeof conn.decodeJid === 'function') {
      target = conn.decodeJid(rawTarget) || rawTarget;
    }
  } catch {}

  if (
    target.endsWith('@lid') ||
    rawTarget.endsWith('@lid')
  ) {
    try {
      if (typeof conn.getPnUser === 'function') {
        const pnUser = await conn.getPnUser(rawTarget);
        if (pnUser?.jid) target = pnUser.jid;
      }
    } catch {}

    if (
      target.endsWith('@lid') &&
      Array.isArray(participants)
    ) {
      const participant = participants.find(p =>
        p?.id === rawTarget ||
        p?.jid === rawTarget ||
        p?.lid === rawTarget
      );

      if (participant) {
        const possibleJid =
          participant.jid ||
          participant.id;

        if (
          possibleJid &&
          possibleJid.endsWith('@s.whatsapp.net')
        ) {
          target = possibleJid;
        }
      }
    }
  }

  const userNumber = target.includes('@s.whatsapp.net')
    ? target.split('@')[0]
    : rawTarget.split('@')[0];

  let userData =
    globalThis.db?.data?.users?.[target] ||
    globalThis.db?.data?.users?.[rawTarget] ||
    {};

  let targetName = userData.name || '';

  if (!targetName) {
    try {
      targetName = await conn.getName(target);
    } catch {}
  }

  if (!targetName && target !== rawTarget) {
    try {
      targetName = await conn.getName(rawTarget);
    } catch {}
  }

  targetName =
    targetName ||
    `@${userNumber}`;

  let avatarUrl =
    'https://files.evogb.win/AGCG2d.jpg';

  try {
    avatarUrl =
      await conn.profilePictureUrl(target, 'image');
  } catch {
    try {
      avatarUrl =
        await conn.profilePictureUrl(rawTarget, 'image');
    } catch {}
  }

  let actor =
    m.participant ||
    m.key?.participant ||
    m.messageStubParameters?.[1] ||
    null;

  if (actor) {
    try {
      if (typeof conn.decodeJid === 'function') {
        actor = conn.decodeJid(actor) || actor;
      }
    } catch {}
  }

  let memberCount = participants?.length || 0;

  if (
    m.messageStubType ===
    WAMessageStubType.GROUP_PARTICIPANT_ADD
  ) {
    memberCount++;
  }

  if (
    m.messageStubType ===
      WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
    m.messageStubType ===
      WAMessageStubType.GROUP_PARTICIPANT_LEAVE
  ) {
    memberCount--;
  }

  const actionText = {
    [WAMessageStubType.GROUP_PARTICIPANT_ADD]:
      actor
        ? `Agregado por @${actor.split('@')[0]}`
        : 'Se unió al grupo',

    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]:
      actor
        ? `Eliminado por @${actor.split('@')[0]}`
        : 'Eliminado del grupo',

    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]:
      'Salió del grupo'
  };

  const format = text =>
    text
      .replaceAll('@user', `@${userNumber}`)
      .replaceAll('@name', targetName)
      .replaceAll('@group', groupMetadata?.subject || 'Grupo')
      .replaceAll(
        '@desc',
        groupMetadata?.desc?.toString() || 'Sin descripción'
      )
      .replaceAll('%users', String(memberCount))
      .replaceAll(
        '@action',
        actionText[m.messageStubType] || ''
      )
      .replaceAll(
        '@date',
        new Date().toLocaleString()
      );

  const welcome = format(`
╔═══❖•°•°•°❖•°•°•°❖═══╗
🌟 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎 🌟
╚═══❖•°•°•°❖•°•°•°❖═══╝

👤 Usuario: @name
📱 Número: @user
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

👤 Usuario: @name
📱 Número: @user
🏷️ Grupo: @group

📌 @action

😢 Esperamos que vuelvas pronto...
👥 Miembros ahora: %users

╔═══❖•°•°•°❖•°•°•°❖═══╗
✦ 𝐕𝐔𝐄𝐋𝐕𝐄 𝐂𝐔𝐀𝐍𝐃𝐎 𝐐𝐔𝐈𝐄𝐑𝐀𝐒 ✦
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim());

  const mentions = [];

  if (target?.includes('@s.whatsapp.net')) {
    mentions.push(target);
  } else if (rawTarget) {
    mentions.push(rawTarget);
  }

  if (
    actor &&
    actor !== target &&
    !mentions.includes(actor)
  ) {
    mentions.push(actor);
  }

  const context = {
    contextInfo: {
      mentionedJid: mentions,
      isForwarded: true
    }
  };

  if (
    chat.welcome &&
    m.messageStubType ===
      WAMessageStubType.GROUP_PARTICIPANT_ADD
  ) {
    const url =
      `${api.url}/welcome` +
      `?name=${encodeURIComponent(targetName)}` +
      `&username=${encodeURIComponent(userNumber)}` +
      `&group=${encodeURIComponent(groupMetadata?.subject || 'Grupo')}` +
      `&userImage=${encodeURIComponent(avatarUrl)}` +
      `&welcomeImage=https://files.evogb.win/SxLysS.jpg` +
      `&apikey=${api.key}`;

    try {
      await conn.sendMessage(m.chat, {
        image: { url },
        caption: welcome,
        ...context
      });
    } catch {}
  }

  if (
    chat.welcome &&
    (
      m.messageStubType ===
        WAMessageStubType.GROUP_PARTICIPANT_LEAVE ||
      m.messageStubType ===
        WAMessageStubType.GROUP_PARTICIPANT_REMOVE
    )
  ) {
    const url =
      `${api.url}/welcome` +
      `?name=${encodeURIComponent(targetName)}` +
      `&username=${encodeURIComponent(userNumber)}` +
      `&group=${encodeURIComponent(groupMetadata?.subject || 'Grupo')}` +
      `&userImage=${encodeURIComponent(avatarUrl)}` +
      `&welcomeImage=https://files.evogb.win/dlaamr.jpg` +
      `&apikey=${api.key}`;

    try {
      await conn.sendMessage(m.chat, {
        image: { url },
        caption: bye,
        ...context
      });
    } catch {}
  }
}