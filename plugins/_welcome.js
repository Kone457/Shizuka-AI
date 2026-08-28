import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const chat = globalThis.db.data.chats[m.chat];
  const stub = m.messageStubParameters?.[0];

  if (!stub) return true;

  let participantData = {};

  try {
    if (typeof stub === 'string' && stub.trim().startsWith('{')) {
      participantData = JSON.parse(stub);
    }
  } catch {}

  const rawTarget =
    participantData.id ||
    participantData.jid ||
    participantData.lid ||
    stub;

  if (!rawTarget) return true;

  const participant = participants.find(p =>
    p?.id === rawTarget ||
    p?.jid === rawTarget ||
    p?.lid === rawTarget ||
    p?.phoneNumber === rawTarget ||
    (
      participantData.lid &&
      (
        p?.id === participantData.lid ||
        p?.jid === participantData.lid ||
        p?.lid === participantData.lid
      )
    )
  ) || {};

  let realJid = null;

  if (
    participantData.phoneNumber &&
    String(participantData.phoneNumber).endsWith('@s.whatsapp.net')
  ) {
    realJid = participantData.phoneNumber;
  }

  if (
    !realJid &&
    participant.phoneNumber &&
    String(participant.phoneNumber).endsWith('@s.whatsapp.net')
  ) {
    realJid = participant.phoneNumber;
  }

  if (
    !realJid &&
    participant.jid &&
    String(participant.jid).endsWith('@s.whatsapp.net')
  ) {
    realJid = participant.jid;
  }

  if (
    !realJid &&
    participant.id &&
    String(participant.id).endsWith('@s.whatsapp.net')
  ) {
    realJid = participant.id;
  }

  if (
    !realJid &&
    String(rawTarget).endsWith('@s.whatsapp.net')
  ) {
    realJid = rawTarget;
  }

  if (!realJid && String(rawTarget).endsWith('@lid')) {
    try {
      if (conn.signalRepository?.lidMapping?.getPNForLID) {
        const pn =
          await conn.signalRepository.lidMapping.getPNForLID(rawTarget);

        if (
          pn &&
          String(pn).endsWith('@s.whatsapp.net')
        ) {
          realJid = pn;
        }
      }
    } catch {}
  }

  if (!realJid && conn.getPnUser) {
    try {
      const result = await conn.getPnUser(rawTarget);

      if (
        result?.jid &&
        String(result.jid).endsWith('@s.whatsapp.net')
      ) {
        realJid = result.jid;
      }
    } catch {}
  }

  if (!realJid) {
    try {
      const decoded = conn.decodeJid(rawTarget);

      if (
        decoded &&
        String(decoded).endsWith('@s.whatsapp.net')
      ) {
        realJid = decoded;
      }
    } catch {}
  }

  const userNumber = (
    realJid ||
    participantData.phoneNumber ||
    rawTarget
  )
    .split('@')[0]
    .replace(/\D/g, '');

  const userData =
    globalThis.db.data.users?.[rawTarget] ||
    globalThis.db.data.users?.[participantData.lid] ||
    globalThis.db.data.users?.[realJid] ||
    {};

  let targetName =
    participantData.name ||
    participantData.notify ||
    participantData.username ||
    participant.notify ||
    participant.name ||
    userData.name ||
    '';

  const invalidName = name => {
    if (!name) return true;

    const value = String(name).trim();

    return (
      !value ||
      value.includes('@lid') ||
      value.includes('@s.whatsapp.net') ||
      /^\d+$/.test(value) ||
      value.replace(/\D/g, '') === userNumber
    );
  };

  if (invalidName(targetName) && realJid) {
    try {
      const name = await conn.getName(realJid);

      if (!invalidName(name)) {
        targetName = name;
      }
    } catch {}
  }

  if (invalidName(targetName)) {
    try {
      const contact =
        conn.contacts?.[realJid] ||
        conn.contacts?.[rawTarget];

      const name =
        contact?.name ||
        contact?.notify ||
        contact?.verifiedName ||
        contact?.shortName ||
        '';

      if (!invalidName(name)) {
        targetName = name;
      }
    } catch {}
  }

  if (invalidName(targetName)) {
    targetName = `Usuario ${userNumber}`;
  }

  const avatarUrl = await conn.profilePictureUrl(
    realJid || rawTarget,
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
    let actorData = {};

    try {
      if (
        typeof actorJid === 'string' &&
        actorJid.trim().startsWith('{')
      ) {
        actorData = JSON.parse(actorJid);
      }
    } catch {}

    const actorRaw =
      actorData.id ||
      actorData.jid ||
      actorData.lid ||
      actorJid;

    const actorParticipant = participants.find(p =>
      p?.id === actorRaw ||
      p?.jid === actorRaw ||
      p?.lid === actorRaw ||
      p?.phoneNumber === actorRaw
    );

    if (
      actorData.phoneNumber &&
      String(actorData.phoneNumber).endsWith('@s.whatsapp.net')
    ) {
      actorJid = actorData.phoneNumber;
    } else if (
      actorParticipant?.phoneNumber &&
      String(actorParticipant.phoneNumber).endsWith('@s.whatsapp.net')
    ) {
      actorJid = actorParticipant.phoneNumber;
    } else if (
      actorParticipant?.jid &&
      String(actorParticipant.jid).endsWith('@s.whatsapp.net')
    ) {
      actorJid = actorParticipant.jid;
    } else {
      actorJid = actorRaw;
    }

    if (String(actorJid).endsWith('@lid')) {
      try {
        if (conn.signalRepository?.lidMapping?.getPNForLID) {
          const pn =
            await conn.signalRepository.lidMapping.getPNForLID(actorJid);

          if (pn) actorJid = pn;
        }
      } catch {}
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
      .replace(
        '@desc',
        groupMetadata.desc?.toString() || 'Sin descripción'
      )
      .replace('%users', memberCount)
      .replace(
        '@action',
        actionText[m.messageStubType] || ''
      )
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

  const mentions = [rawTarget];

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