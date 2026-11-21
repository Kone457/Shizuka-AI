import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';
const haremFilePath = './lib/harem.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('❏ مقدرتش أحمّل ملف characters.json.');
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

let handler = async (m, { conn, args }) => {
    if (args.length === 0) {
        await conn.reply(m.chat, '《✧》لازم تحدد شخصية عشان تشوف معلوماتها.\n> مثال » *#winfo Aika Sano*', m);
        return;
    }

    const characterName = args.join(' ').toLowerCase().trim();

    try {
        const characters = await loadCharacters();
        const character = characters.find(c => c.name.toLowerCase() === characterName);

        if (!character) {
            await conn.reply(m.chat, `《✧》مقدرتش ألاقي الشخصية *${characterName}*.`, m);
            return;
        }

        const harem = await loadHarem();
        const userEntry = harem.find(entry => entry.characterId === character.id);
        const statusMessage = userEntry 
            ? `مطالب بيها @${userEntry.userId.split('@')[0]}` 
            : 'Libre';
        
        const message = `❀ الاسم » *${character.name}*\n⚥ النوع » *${character.gender}*\n✰ القيمة » *${character.value}*\n♡ الحالة » ${statusMessage}\n❖ المصدر » *${character.source}*`;

        await conn.reply(m.chat, message, m, { mentions: [userEntry ? userEntry.userId : null] });
    } catch (error) {
        await conn.reply(m.chat, `✘ خطأ في تحميل معلومات الشخصية: ${error.message}`, m);
    }
};

handler.help = ['شخصية'];
handler.tags = ['gacha'];
handler.command = ['charinfo', 'winfo', 'waifuinfo', 'شخصية', 'معلومات_ويفو'];
handler.group = true;
handler.gacha = true;

export default handler;
