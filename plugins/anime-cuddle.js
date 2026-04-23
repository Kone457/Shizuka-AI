
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
    m.react('👥');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *se acurrucó con* ${name || who}.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *está acurrucándose con* ${name || who}.`;
    } else {
        str = `\`${name2}\` *se esta acurrucando.*`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/60500e485e.mp4'; 
        let pp2 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/1d4b95642f.mp4'; 
        let pp3 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/e92a96833e.mp4';
        let pp4 = 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/280b598160.mp4';
        
        const videos = [pp, pp2, pp3, pp4];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['cuddle'];
handler.tags = ['anime'];
handler.command = ['cuddle', 'acurrucarse'];
handler.group = true;

export default handler;