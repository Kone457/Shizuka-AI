import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';
const haremFilePath = './lib/harem.json';

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('《✧》مقدرتش أحمّل ملف characters.json.');
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2));
    } catch (error) {
        throw new Error('《✧》مقدرتش أحفظ ملف characters.json.');
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

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2));
    } catch (error) {
        throw new Error('《✧》مقدرتش أحفظ ملف harem.json.');
    }
}

let cooldowns = new Map();
let characterVotes = new Map();

let handler = async (m, { conn, args }) => {
    try {
        const userId = m.sender;
        const cooldownTime = 1 * 60 * 60 * 1000;

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownTime;
            const now = Date.now();
            if (now < expirationTime) {
                const timeLeft = expirationTime - now;
                const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
                const seconds = Math.floor((timeLeft / 1000) % 60);
                await conn.reply(m.chat, `《✧》لازم تستنى *${Math.floor(minutes)} دقيقة ${seconds} ثانية* عشان تستخدم *#vote* تاني.`, m);
                return;
            }
        }

        const characters = await loadCharacters();
        const characterName = args.join(' ');

        if (!characterName) {
            await conn.reply(m.chat, '《✧》لازم تحدد شخصية عشان تصوّت لها.', m);
            return;
        }

        const originalCharacterName = characterName;
        const character = characters.find(c => c.name.toLowerCase() === originalCharacterName.toLowerCase());

        if (!character) {
            await conn.reply(m.chat, '《✧》الشخصية مش موجودة. اتأكد إن الاسم مكتوب صح.', m);
            return;
        }

        if (characterVotes.has(originalCharacterName) && Date.now() < characterVotes.get(originalCharacterName)) {
            const expirationTime = characterVotes.get(originalCharacterName);
            const timeLeft = expirationTime - Date.now();
            const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);
            await conn.reply(m.chat, `《✧》الشخصية *${originalCharacterName}* اتصوّت لها قريب. لازم تستنى *${Math.floor(minutes)} دقيقة ${seconds} ثانية* عشان تصوّت تاني.`, m);
            return;
        }

        const incrementValue = Math.floor(Math.random() * 10) + 1;
        character.value = String(Number(character.value) + incrementValue);
        character.votes += 1;
        await saveCharacters(characters);

        const harem = await loadHarem();
        const userEntry = harem.find(entry => entry.userId === userId && entry.characterId === character.id);

        if (!userEntry) {
            harem.push({
                userId: userId,
                characterId: character.id,
                lastVoteTime: Date.now(),
                voteCooldown: Date.now() + cooldownTime
            });
        } else {
            userEntry.lastVoteTime = Date.now();
            userEntry.voteCooldown = Date.now() + cooldownTime;
        }
        await saveHarem(harem);

        cooldowns.set(userId, Date.now());
        characterVotes.set(originalCharacterName, Date.now() + cooldownTime);

        await conn.reply(m.chat, `✰ صوّتت للشخصية *${originalCharacterName}*\n> قيمتها الجديدة *${character.value}* (زادت *${incrementValue}*)\n> الإجمالي الأصوات: *${character.votes}*`, m);
    } catch (e) {
        await conn.reply(m.chat, `✘ خطأ في تحديث القيمة: ${e.message}`, m);
    }
};

handler.help = ['فوت'];
handler.tags = ['gacha'];
handler.command = ['vote', 'votar', 'فوت', 'صوّت'];
handler.group = true;
handler.gacha = true;

export default handler;
