import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    let who;
    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    m.react('💦');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *se lo metió sabrosamente a* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *se vino dentro de* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *se vino dentro de... Omitiremos eso*`.trim();
    }

    if (m.isGroup) {
        let pp = 'https://magical.vercel.app/files/9c65469130d6.mp4'; 
        let pp2 = 'https://magical.vercel.app/files/1307619ad3ff.mp4'; 
        let pp3 = 'https://magical.vercel.app/files/c024f2dbd32b.mp4';
        let pp4 = 'https://magical.vercel.app/files/afd46f024ff1.mp4';

        const videos = [pp, pp2, pp3, pp4];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['cum'];
handler.tags = ['nsfw'];
handler.command = ['cum'];
handler.group = true;
handler.nsfw = true;

export default handler;