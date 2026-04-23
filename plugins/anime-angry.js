
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
    m.react('😡');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *está enojado/a con* \`${name || who}\`.`; 
    } else if (m.quoted) {
        str = `\`${name2}\` *está enojado/a con* \`${name || who}\`.`; 
    } else {
        str = `\`${name2}\` *está enojado/a.*`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/d80daa67bf.mp4'; 
        let pp2 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/92eb27d9e6.mp4'; 
        let pp3 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/c57ab0faeb.mp4';
        let pp4 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/d8e8618f1c.mp4';
        
        const videos = [pp, pp2, pp3, pp4];
        const video = videos[Math.floor(Math.random() * videos.length)];
     
        let mentions = [who]; 
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['angry'];
handler.tags = ['anime'];
handler.command = ['angry','enojado'];
handler.group = true;

export default handler;