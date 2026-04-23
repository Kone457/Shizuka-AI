
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
    m.react('😁');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *está feliz por* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *está feliz por* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *está muy feliz hoy.*`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/20c6772812.mp4'; 
        let pp2 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/21e5a361b4.mp4'; 
        let pp3 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/e9c628b6a4.mp4';
        let pp4 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/04b941e024.mp4';
        
        const videos = [pp, pp2, pp3, pp4];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['happy'];
handler.tags = ['anime'];
handler.command = ['happy', 'feliz'];
handler.group = true;

export default handler;