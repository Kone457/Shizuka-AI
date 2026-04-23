
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
    m.react('☕');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *tomá una tácita de café con* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *esta tomándo una tácita de café con* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *se toma una tácita de café.*`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/501e03e9dd.mp4'; 
        let pp2 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/23ba7f263e.mp4'; 
        let pp3 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/2c6f5e3244.mp4';
        let pp4 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/93a5f1e7ac.mp4';
        
        const videos = [pp, pp2, pp3, pp4];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['coffe'];
handler.tags = ['anime'];
handler.command = ['coffe', 'cafe'];
handler.group = true;

export default handler;