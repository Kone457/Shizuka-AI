import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('storage/databases/marry.json');
let proposals = {};
let marriages = loadMarriages();
const confirmation = {};

function loadMarriages() {
    return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {};
}

function saveMarriages() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

const handler = async (m, { conn, command }) => {
    const isPropose = /^marry$/i.test(command);
    const isDivorce = /^divorce$/i.test(command);

    const userIsMarried = (user) => marriages[user] !== undefined;

    try {
        if (isPropose) {
            const proposee = m.quoted?.sender || m.mentionedJid?.[0];
            const proposer = m.sender;

            if (!proposee) {
                if (userIsMarried(proposer)) {
                    return await conn.reply(
                        m.chat,
                        `《✧》 Ya estás casado con *${conn.getName(marriages[proposer])}*\n> Puedes divorciarte con el comando: *#divorce*`,
                        m
                    );
                } else {
                    throw new Error('Debes mencionar a alguien para aceptar o proponer matrimonio.\n> Ejemplo » *#marry @usuario*');
                }
            }
            if (userIsMarried(proposer)) throw new Error(`Ya estás casado con ${conn.getName(marriages[proposer])}.`);
            if (userIsMarried(proposee)) throw new Error(`${conn.getName(proposee)} ya está casado con ${conn.getName(marriages[proposee])}.`);
            if (proposer === proposee) throw new Error('¡No puedes proponerte matrimonio a ti mismo!');

            proposals[proposer] = proposee;
            const proposerName = conn.getName(proposer);
            const proposeeName = conn.getName(proposee);

            const confirmationMessage = `♡ ${proposerName} te ha propuesto matrimonio, ${proposeeName} 💍\n\n¿Aceptas la propuesta?`;

            // --- Botones de aceptación / rechazo ---
            const buttons = [
                { buttonId: "marry-yes", buttonText: { displayText: "✅ Sí, acepto" }, type: 1 },
                { buttonId: "marry-no", buttonText: { displayText: "❌ No, rechazo" }, type: 1 }
            ];

            await conn.sendMessage(
                m.chat,
                {
                    text: confirmationMessage,
                    buttons,
                    mentions: [proposee, proposer],
                    footer: "⏳ Tienes 1 minuto para responder"
                },
                { quoted: m }
            );

            confirmation[proposee] = {
                proposer,
                timeout: setTimeout(() => {
                    conn.sendMessage(
                        m.chat,
                        { text: '*《✧》Se acabó el tiempo, no se obtuvo respuesta. La propuesta de matrimonio fue cancelada.*' },
                        { quoted: m }
                    );
                    delete confirmation[proposee];
                }, 60000)
            };

        } else if (isDivorce) {
            if (!userIsMarried(m.sender)) throw new Error('No estás casado con nadie.');

            const partner = marriages[m.sender];
            delete marriages[m.sender];
            delete marriages[partner];
            saveMarriages();

            await conn.reply(m.chat, `✐ ${conn.getName(m.sender)} y ${conn.getName(partner)} se han divorciado 💔.`, m);
        }
    } catch (error) {
        await conn.reply(m.chat, `《✧》 ${error.message}`, m);
    }
};

// --- Manejo de los botones ---
handler.before = async (m, { conn }) => {
    if (m.isBaileys) return;
    if (!(m.sender in confirmation)) return;

    const { proposer, timeout } = confirmation[m.sender];

    if (m?.message?.buttonsResponseMessage) {
        const buttonId = m.message.buttonsResponseMessage.selectedButtonId;

        if (buttonId === "marry-no") {
            clearTimeout(timeout);
            delete confirmation[m.sender];
            return conn.sendMessage(m.chat, { text: '*《✧》Han rechazado tu propuesta de matrimonio ❌*' }, { quoted: m });
        }

        if (buttonId === "marry-yes") {
            delete proposals[proposer];
            marriages[proposer] = m.sender;
            marriages[m.sender] = proposer;
            saveMarriages();

            conn.sendMessage(
                m.chat,
                {
                    text: `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩
💞 ¡Se han casado! 💞

*•.¸♡ Esposo:* ${conn.getName(proposer)}
*•.¸♡ Esposa:* ${conn.getName(m.sender)}

✨ Disfruten de su luna de miel ✨
✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩`,
                    mentions: [proposer, m.sender]
                },
                { quoted: m }
            );

            clearTimeout(timeout);
            delete confirmation[m.sender];
        }
    }
};

handler.tags = ['fun'];
handler.help = ['marry *@usuario*', 'divorce'];
handler.command = ['marry', 'divorce'];
handler.group = true;

export default handler;