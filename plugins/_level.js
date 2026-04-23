import { canLevelUp, xpRange } from '../lib/levelling.js';

let handler = m => m;
handler.before = async function (m, { conn }) {
    let user = globalThis.db.data.chats[m.chat]

    let before = user.level;

    while (canLevelUp(user.level, user.exp, globalThis.multiplier)) {
        user.level++;
    }
    if (before !== user.level) {
        let { min, max } = xpRange(user.level, globalThis.multiplier);
    }

     return true;
};

export default handler;