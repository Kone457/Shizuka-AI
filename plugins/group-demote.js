import { getBotConfig } from '../lib/botconfig.js'
import axios from "axios";
import { generateWAMessageFromContent } from "@whiskeysockets/baileys";

let bannerCache    = null
let bannerCacheTime = 0
let lastUsedUrl     = null

async function getBuffer(url) {
  try {
    const res = await axios({ method: "get", url, responseType: "arraybuffer" });
    return Buffer.from(res.data);
  } catch (e) {
    throw new Error(`Error descargando imagen: ${e.message}`);
  }
}

async function getBannerBuffer(url) {
  if (bannerCache && lastUsedUrl === url && Date.now() - bannerCacheTime < 3600000) return bannerCache
  bannerCache = await getBuffer(url)
  bannerCacheTime = Date.now()
  lastUsedUrl = url
  return bannerCache
}

const handler = async (m, { conn, command }) => {
  const botname = getBotConfig(conn, 'botname')
  const banner  = getBotConfig(conn, 'banner')
  const dev     = global.dev
  try {
    const jid = (id) => id?.includes('@') ? id : `${id}@s.whatsapp.net`;
    let who = m.mentionedJid?.[0] || m.msg?.contextInfo?.mentionedJid?.[0] || m.quoted?.sender || null;

    if (!who) {
      return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚙️ 𝐀𝐂𝐂𝐈𝐎́𝐍 𝐃𝐄 𝐀𝐃𝐌𝐈𝐍 ⚙️╮
┃֪࣪
├ׁ̟̇❍✎ Debes mencionar o responder a un usuario
├ׁ̟̇❍✎ para ejecutar esta acción
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯
`.trim());
    }

    who = jid(who);
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => jid(p.id || p.jid) === who);
    const isPromote = command === 'promote';

    const sendAdvancedMessage = async (textMessage) => {
      const urlFoto = banner || "https://files.evogb.win/oGMH11.png";
      const bufferBanner = await getBannerBuffer(urlFoto);
      const linkMatch = "https://xvideos.com";  

      const content = {  
        extendedTextMessage: {  
          text: textMessage,  
          matchedText: linkMatch,  
          canonicalUrl: linkMatch,  
          description: `${dev} | ${botname}`,  
          title: botname.toUpperCase(),  
          previewType: 0,  
          jpegThumbnail: bufferBanner, // Enviamos el buffer directo aquí para evitar fallos de renderizado
          thumbnailHeight: 1080,  
          thumbnailWidth: 1920,  
          inviteLinkGroupTypeV2: 0,  
          contextInfo: {  
            mentionedJid: [who],  
            isForwarded: true,  
            forwardingScore: 1,  
            forwardedNewsletterMessageInfo: {  
              newsletterJid: "120363424754823499@newsletter",  
              newsletterName: "（´•̥̥̥ω•̥̥̥`）♡ 𝑆ℎ𝑖𝑧𝑢𝑘𝑎-𝐴𝐼 ♡（´•̥̥̥ω•̥̥̥`）",  
              serverMessageId: -1  
            }  
          }  
        }  
      };  

      const waMsg = generateWAMessageFromContent(m.chat, content, { userJid: conn.user?.id, quoted: m });
      await conn.relayMessage(m.chat, waMsg.message, { messageId: waMsg.key.id });
    };

    if (isPromote) {
      if (participant?.admin) {
        return sendAdvancedMessage(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼👑 𝐘𝐀 𝐄𝐒 𝐀𝐃𝐌𝐈𝐍 👑╮
┃֪࣪
├ׁ̟̇❍✎ @${who.split('@')[0]} ya es administrador
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
      }

      await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
      return sendAdvancedMessage(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼👑 𝐍𝐔𝐄𝐕𝐎 𝐀𝐃𝐌𝐈𝐍 👑╮
┃֪࣪
├ׁ̟̇❍✎ @${who.split('@')[0]}
├ׁ̟̇❍✎ ahora es administrador
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
    }

    if (!participant?.admin) {
      return sendAdvancedMessage(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⚠️ 𝐍block 𝐄𝐒 𝐀𝐃𝐌𝐈𝐍 ⚠️╮
┃֪࣪
├ׁ̟̇❍✎ @${who.split('@')[0]} no es administrador
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
    }

    if (who === groupMetadata.owner) {
      return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐏𝐑𝐎𝐓𝐄𝐂𝐂block ⛔╮
┃֪࣪
├ׁ̟̇❍✎ No puedes degradar al creador
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
    }

    if (who === conn.user.jid) {
      return m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼🤖 𝐁block 𝐓 𝐏𝐑block 𝐓𝐄𝐆𝐈𝐃block 🤖╮
┃֪࣪
├ׁ̟̇❍✎ No puedes degradar al bot
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
    return sendAdvancedMessage(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⬇️ 𝐀𝐃𝐌𝐈𝐍 𝐑block 𝐌block 𝐕𝐈𝐃block ⬇️╮
┃֪࣪
├ׁ̟̇❍✎ @${who.split('@')[0]}
├ׁ̟̇❍✎ fue degradado a usuario
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());

  } catch (e) {
    m.reply(`
╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼⛔ 𝐄𝐑𝐑block 𝐑 ⛔╮
┃֪࣪
├ׁ̟̇❍✎ ${e.message}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`.trim());
  }
};

handler.help = ['promote', 'demote'];
handler.tags = ['grupo'];
handler.command = ['promote', 'demote'];
handler.admin = true;
handler.botAdmin = true;

export default handler;
