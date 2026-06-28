import axios from "axios";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@whiskeysockets/baileys";
import { getBotConfig } from '../lib/botconfig.js';

async function getBuffer(url) {
  const res = await axios({ method: "get", url, responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

const handler = async (m, { conn, command }) => {
  const botname = getBotConfig(conn, 'botname');
  const banner  = getBotConfig(conn, 'banner');
  const dev     = global.dev;

  try {
    const jid = (id) => id?.includes('@') ? id : `${id}@s.whatsapp.net`;
    let who = m.mentionedJid?.[0] || m.msg?.contextInfo?.mentionedJid?.[0] || m.quoted?.sender || null;

    if (!who) return m.reply(`⚙️ Debes mencionar o responder a un usuario`);

    who = jid(who);
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => jid(p.id || p.jid) === who);
    const isPromote = command === 'promote';

    const bufferBanner = await getBuffer(banner);
    const mediaBanner  = await prepareWAMessageMedia(
      { image: bufferBanner },
      { upload: conn.waUploadToServer, mediaTypeOverride: "thumbnail-link" }
    );
    const imgBanner = mediaBanner.imageMessage;
    const getTs = (ts) => typeof ts === "object" ? Number(ts.low || ts) : Number(ts);

    const buildContent = (texto) => ({
      extendedTextMessage: {
        text: texto,
        canonicalUrl: '',
        description: `Powered by ${dev} | ${botname}`,
        title: botname.toUpperCase(),
        previewType: 0,
        jpegThumbnail: imgBanner.jpegThumbnail,
        thumbnailDirectPath: imgBanner.directPath,
        thumbnailSha256: imgBanner.fileSha256,
        thumbnailEncSha256: imgBanner.fileEncSha256,
        mediaKey: imgBanner.mediaKey,
        mediaKeyTimestamp: getTs(imgBanner.mediaKeyTimestamp),
        thumbnailHeight: imgBanner.height || 1080,
        thumbnailWidth: imgBanner.width || 1920,
        inviteLinkGroupTypeV2: 0,
        contextInfo: {
          mentionedJid: [who],
          isForwarded: true,
          forwardingScore: 1
        }
      }
    });

    if (isPromote) {
      if (participant?.admin) {
        const waMsg = generateWAMessageFromContent(m.chat, buildContent(`👑 @${who.split('@')[0]} ya es administrador`), { userJid: conn.user?.id, quoted: m });
        return conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id });
      }
      await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
      const waMsg = generateWAMessageFromContent(m.chat, buildContent(`👑 @${who.split('@')[0]} ahora es administrador`), { userJid: conn.user?.id, quoted: m });
      return conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id });
    }

    if (!participant?.admin) {
      const waMsg = generateWAMessageFromContent(m.chat, buildContent(`⚠️ @${who.split('@')[0]} no es administrador`), { userJid: conn.user?.id, quoted: m });
      return conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id });
    }

    if (who === groupMetadata.owner) return m.reply(`⛔ No puedes degradar al creador`);
    if (who === conn.user.jid) return m.reply(`🤖 No puedes degradar al bot`);

    await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
    const waMsg = generateWAMessageFromContent(m.chat, buildContent(`⬇️ @${who.split('@')[0]} fue degradado a usuario`), { userJid: conn.user?.id, quoted: m });
    return conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id });

  } catch (e) {
    m.reply(`⛔ Error: ${e.message}`);
  }
};

handler.help = ['promote', 'demote'];
handler.tags = ['grupo'];
handler.command = ['promote', 'demote'];
handler.admin = true;
handler.botAdmin = true;

export default handler;