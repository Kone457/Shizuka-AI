import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];
  const rawTarget = m.messageStubParameters?.[0];

  if (!rawTarget) return true;

  const participant = participants.find(p =>
    p?.id === rawTarget ||
    p?.jid === rawTarget ||
    p?.lid === rawTarget ||
    p?.phoneNumber === rawTarget
  ) || {};

  let realJid = null;

  if (participant.phoneNumber) {
    realJid = participant.phoneNumber.includes('@')
      ? participant.phoneNumber
      : `${participant.phoneNumber}@s.whatsapp.net`;
  }

  if (!realJid && participant.jid?.endsWith('@s.whatsapp.net')) {
    realJid = participant.jid;
  }

  if (!realJid && participant.id?.endsWith('@s.whatsapp.net')) {
    realJid = participant.id;
  }

  if (!realJid && rawTarget.endsWith('@lid')) {
    try {
      const pn = await conn.signalRepository?.lidMapping?.getPNForLID(rawTarget);
      if (pn) realJid = pn;
    } catch {}
  }

  if (!realJid && rawTarget.endsWith('@lid')) {
    try {
      const pn = await conn.getPnUser?.(rawTarget);
      if (pn?.jid) realJid = pn.jid;
    } catch {}
  }

  if (!realJid) {
    try {
      const decoded = conn.decodeJid(rawTarget);
      if (decoded?.endsWith('@s.whatsapp.net')) {
        realJid = decoded;
      }
    } catch {}
  }

  if (!realJid) {
    realJid = rawTarget;
  }

  const userNumber = realJid
    .split('@')[0]
    .replace(/\D/g, '');

  const userData =
    globalThis.db.data.users?.[rawTarget] ||
    globalThis.db.data.users?.[realJid] ||
    {};

  let targetName =
    participant.notify ||
    participant.name ||
    userData.name ||
    '';

  if (
    !targetName ||
    /^\d+$/.test(String(targetName)) ||
    String(targetName).includes('@lid')
  ) {
    try {
      const name = await conn.getName(realJid);

      if (
        name &&
        !/^\d+$/.test(String(name)) &&
        !String(name).includes('@lid')
      ) {
        targetName = name;
      }
    } catch {}
  }

  if (
    !targetName ||
    /^\d+$/.test(String(targetName)) ||
    String(targetName).includes('@lid')
  ) {
    try {
      const name = await conn.getName(rawTarget);

      if (
        name &&
        !/^\d+$/.test(String(name)) &&
        !String(name).includes('@lid')
      ) {
        targetName = name;
      }
    } catch {}
  }

  if (
    !targetName ||
    /^\d+$/.test(String(targetName)) ||
    String(targetName).includes('@lid')
  ) {
    targetName = userData.name || `@${userNumber}`;
  }

  const avatarUrl = await conn.profilePictureUrl(
    realJid,
    'image'
  ).catch(async () => {
    try {
      return await conn.profilePictureUrl(
        rawTarget,
        'image'
      );
    } catch {
      return 'https://files.evogb.win/AGCG2d.jpg';
    }
  });

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
      actorJid = actorParticipant.phoneNumber.includes('@')
        ? actorParticipant.phoneNumber
        : `${actorParticipant.phoneNumber}@s.whatsapp.net`;
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

👤 Usuario: @user
🏷️ Grupo: @group

📌 @action

📜 Descripción del grupo:
@desc

👥 Miembro # %users
⚠️ Lee las reglas para evitar BAN.

╔═══❖•°•°•°❖•°•°•°❖═══╗
✦ 𝐃𝐈𝐒𝐅𝐑𝐔𝐓𝐀 𝐓𝐔 𝐄𝐒𝐓𝐀𝐍𝐂𝐈𝐀 ✦
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

  const mentions = [realJid];

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
    m.messageStubType ===
      WAMessageStubType.GROUP_PARTICIPANT_ADD
  ) {
    const url =
      `${api.url}/welcome` +
      `?name=${encodeURIComponent(targetName)}` +
      `&username=${encodeURIComponent('Aqui te van a violar')}` +
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
      `&username=${encodeURIComponent('Ojala y te atropelle un tren')}` +
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
