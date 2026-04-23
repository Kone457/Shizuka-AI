
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
    m.react('😅');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *mordió a* \`${name || who}\`.`; 
    } else if (m.quoted) {
        str = `\`${name2}\` *mordió a* \`${name || who}\`.`; 
    } else {
        str = `\`${name2}\` *se mordió a sí mismo*`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/c78f05ab2d.mp4'; 
        let pp2 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/3c253c9459.mp4'; 
        let pp3 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/69470b97a7.mp4';
        let pp4 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/229f06b30d.mp4';
        
        const videos = [pp, pp2, pp3, pp4];
        const video = videos[Math.floor(Math.random() * videos.length)];
        

        let mentions = [who]; 
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['bite'];
handler.tags = ['anime'];
handler.command = ['bite','morder'];
handler.group = true;

export default handler;