import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];
  const rawTarget = m.messageStubParameters?.[0];

  if (!rawTarget) return true;

  let targetData = {};

  try {
    targetData =
      typeof rawTarget === 'string' && rawTarget.startsWith('{')
        ? JSON.parse(rawTarget)
        : {};
  } catch {}

  const targetId =
    targetData.id ||
    targetData.jid ||
    targetData.lid ||
    rawTarget;

  const participant = participants.find(p =>
    p?.id === targetId ||
    p?.jid === targetId ||
    p?.lid === targetId ||
    p?.phoneNumber === targetData.phoneNumber
  ) || {};

  const realJid =
    participant.phoneNumber ||
    targetData.phoneNumber ||
    participant.jid ||
    (participant.id?.endsWith('@s.whatsapp.net')
      ? participant.id
      : null) ||
    (targetId?.endsWith('@s.whatsapp.net')
      ? targetId
      : null);

  if (!realJid) return true;

  const userNumber = realJid
    .split('@')[0]
    .replace(/\D/g, '');

  const userData =
    globalThis.db.data.users?.[targetId] ||
    globalThis.db.data.users?.[participant.id] ||
    globalThis.db.data.users?.[realJid] ||
    {};

  const invalidName = value => {
    if (!value) return true;

    const name = String(value).trim();

    return (
      !name ||
      /^\d+$/.test(name) ||
      name.includes('@lid') ||
      name.includes('@s.whatsapp.net') ||
      name.replace(/\D/g, '') === userNumber
    );
  };

  let targetName = null;

  const names = [
    targetData.name,
    targetData.notify,
    m.name,
    m.pushName,
    participant.name,
    participant.notify,
    participant.vname,
    userData.name
  ];

  for (const name of names) {
    if (!invalidName(name)) {
      targetName = String(name).trim();
      break;
    }
  }

  if (!targetName) {
    try {
      const contact =
        conn.contacts?.[realJid] ||
        conn.store?.contacts?.[realJid];

      const name =
        contact?.name ||
        contact?.notify ||
        contact?.pushName ||
        contact?.verifiedName ||
        contact?.shortName;

      if (!invalidName(name)) {
        targetName = String(name).trim();
      }
    } catch {}
  }

  if (!targetName) {
    try {
      const name = await conn.getName(realJid);

      if (!invalidName(name)) {
        targetName = String(name).trim();
      }
    } catch {}
  }

  if (!targetName) {
    targetName = userData.name || `@${userNumber}`;
  }

  const avatarUrl = await conn.profilePictureUrl(
    realJid,
    'image'
  ).catch(() =>
    'https://files.evogb.win/AGCG2d.jpg'
  );

  const actor =
    m.participant ||
    m.key?.participant ||
    m.messageStubParameters?.[1] ||
    null;

  let actorJid = actor;

  if (actorJid) {
    const actorParticipant = participants.find(p =>
      p?.id === actorJid ||
      p?.jid === actorJid ||
      p?.lid === actorJid
    );

    if (actorParticipant?.phoneNumber) {
      actorJid = actorParticipant.phoneNumber;
    } else if (actorParticipant?.jid?.endsWith('@s.whatsapp.net')) {
      actorJid = actorParticipant.jid;
    }

    try {
      actorJid = conn.decodeJid(actorJid) || actorJid;
    } catch {}
  }

  let memberCount = participants.length;

  if (
    m.messageStubType ===
    WAMessageStubType.GROUP_PARTICIPANT_ADD
  ) {
    memberCount++;
  }

  if (
    [
      WAMessageStubType.GROUP_PARTICIPANT_REMOVE,
      WAMessageStubType.GROUP_PARTICIPANT_LEAVE
    ].includes(m.messageStubType)
  ) {
    memberCount--;
  }

  const actionText = {
    [WAMessageStubType.GROUP_PARTICIPANT_ADD]:
      actorJid
        ? `Agregado por @${actorJid.split('@')[0]}`
        : 'Se unió al grupo',

    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]:
      actorJid
        ? `Eliminado por @${actorJid.split('@')[0]}`
        : 'Eliminado del grupo',

    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]:
      'Salió del grupo'
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

👤 Usuario: @name
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
🏷️ Grupo: @group

📌 @action

😢 Esperamos que vuelvas pronto...
👥 Miembros ahora: %users

╔═══❖•°•°•°❖•°•°•°❖═══╗
✦ 𝐕𝐔𝐄𝐋𝐕𝐄 𝐂𝐔𝐀𝐍𝐃𝐎 𝐐𝐔𝐈𝐄𝐑𝐀𝐒 ✦
╚═══❖•°•°•°❖•°•°•°❖═══╝
`.trim());

  const mentions = [targetId];

  if (actorJid && !mentions.includes(actorJid)) {
    mentions.push(actorJid);
  }

  const context = {
    contextInfo: {
      mentionedJid: mentions,
      isForwarded: true
    }
  };

  if (
    chat.welcome &&
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
  ) {
    const url =
      `${api.url}/welcome` +
      `?name=${encodeURIComponent(targetName)}` +
      `&username=${encodeURIComponent(userNumber)}` +
      `&group=${encodeURIComponent(groupMetadata.subject)}` +
      `&userImage=${encodeURIComponent(avatarUrl)}` +
      `&welcomeImage=https://files.evogb.win/SxLysS.jpg` +
      `&apikey=${api.key}`;

    await conn.sendMessage(m.chat, {
      image: { url },
      caption: welcome,
      ...context
    });
  }

  if (
    chat.welcome &&
    [
      WAMessageStubType.GROUP_PARTICIPANT_LEAVE,
      WAMessageStubType.GROUP_PARTICIPANT_REMOVE
    ].includes(m.messageStubType)
  ) {
    const url =
      `${api.url}/welcome` +
      `?name=${encodeURIComponent(targetName)}` +
      `&username=${encodeURIComponent(userNumber)}` +
      `&group=${encodeURIComponent(groupMetadata.subject)}` +
      `&userImage=${encodeURIComponent(avatarUrl)}` +
      `&welcomeImage=https://files.evogb.win/dlaamr.jpg` +
      `&apikey=${api.key}`;

    await conn.sendMessage(m.chat, {
      image: { url },
      caption: bye,
      ...context
    });
  }
}