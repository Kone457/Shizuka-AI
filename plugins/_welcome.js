
import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chat = globalThis.db?.data?.chats?.[m.chat];
  if (!chat) return;

  const rawTarget = m.messageStubParameters?.[0];
  if (!rawTarget) return;

  const participant =
    participants.find(p =>
      p?.id === rawTarget ||
      p?.jid === rawTarget ||
      p?.lid === rawTarget ||
      p?.phoneNumber === rawTarget
    ) || {};

  let target = participant.phoneNumber || '';

  if (!target && participant.jid?.endsWith('@s.whatsapp.net')) {
    target = participant.jid;
  }

  if (!target && participant.id?.endsWith('@s.whatsapp.net')) {
    target = participant.id;
  }

  if (!target) {
    try {
      const decoded = conn.decodeJid(rawTarget);

      if (
        decoded &&
        decoded.endsWith('@s.whatsapp.net')
      ) {
        target = decoded;
      }
    } catch {}
  }

  if (!target) {
    target = rawTarget;
  }

  if (!target.endsWith('@s.whatsapp.net')) {
    try {
      const pn = await conn.getPnUser?.(rawTarget);

      if (pn?.jid?.endsWith('@s.whatsapp.net')) {
        target = pn.jid;
      }
    } catch {}
  }

  const userNumber = target
    .replace('@s.whatsapp.net', '')
    .replace(/\D/g, '');

  let userData =
    globalThis.db?.data?.users?.[rawTarget] ||
    globalThis.db?.data?.users?.[target] ||
    {};

  let targetName =
    userData?.name ||
    participant?.notify ||
    participant?.name ||
    '';

  if (!targetName) {
    try {
      targetName = await conn.getName(rawTarget);
    } catch {}
  }

  if (
    !targetName ||
    /^\d+$/.test(String(targetName)) ||
    String(targetName).includes('@lid')
  ) {
    try {
      targetName = await conn.getName(target);
    } catch {}
  }

  if (
    !targetName ||
    /^\d+$/.test(String(targetName)) ||
    String(targetName).includes('@lid')
  ) {
    targetName = `@${userNumber}`;
  }

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
    const actorParticipant =
      participants.find(p =>
        p?.id === actor ||
        p?.jid === actor ||
        p?.lid === actor
      ) || {};

    const actorPhone =
      actorParticipant.phoneNumber ||
      actorParticipant.jid ||
      actor;

    actor = actorPhone;

    try {
      const decoded = conn.decodeJid(actor);

      if (decoded) {
        actor = decoded;
      }
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
╚═══❖•°•°•°❖═══╗
`.trim());

  const mentions = [];

  if (target.endsWith('@s.whatsapp.net')) {
    mentions.push(target);
  }

  if (
    actor &&
    actor.endsWith('@s.whatsapp.net') &&
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
      `&group=${encodeURIComponent(groupMetadata?.subject || 'Grupo')}` +
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