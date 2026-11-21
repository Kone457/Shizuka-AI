import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('《✧》مقدرتش أحمّل ملف characters.json.');
    }
}

let handler = async (m, { conn, args }) => {
    try {
        const characters = await loadCharacters();
        const page = parseInt(args[0]) || 1;
        const itemsPerPage = 10;
        const sortedCharacters = characters.sort((a, b) => Number(b.value) - Number(a.value));

        const totalCharacters = sortedCharacters.length;
        const totalPages = Math.ceil(totalCharacters / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const charactersToShow = sortedCharacters.slice(startIndex, endIndex);

        let message = '✿ *أعلى الشخصيات قيمة:*\n';
        charactersToShow.forEach((character, index) => {
            message += `✰ ${startIndex + index + 1} » *${character.name}*\n`;
            message += `\t\t→ القيمة: *${character.value}*\n`;
        });

        message += `⌦ • صفحة *${page}* من *${totalPages}*.`;

        await conn.reply(m.chat, message, m);
    } catch (error) {
        await conn.reply(m.chat, `✘ خطأ في تحميل الشخصيات: ${error.message}`, m);
    }
};

handler.help = ['توب ويفو'];
handler.tags = ['gacha'];
handler.command = ['topwaifus', 'waifustop', 'waifusboard', 'توبويفو', 'افضلويفو', 'لوحةالويفو', 'توب ويفو', 'افضل ويفو', 'لوحة الويفو'];
handler.group = true;
handler.gacha = true;

export default handler;
