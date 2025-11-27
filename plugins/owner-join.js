let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text, isOwner }) => {
    if (!text) return m.reply(` Debes enviar una invitacion para que *${botname}* se una al grupo.`);

    let [_, code] = text.match(linkRegex) || [];

    if (!code) return m.reply(` Enlace de invitación no válido.`);

    if (isOwner) {
        await conn.groupAcceptInvite(code)
            .then(res => m.reply(` Me he unido exitosamente al grupo.`))
            .catch(err => m.reply(`${msm} Error al unirme al grupo.`));
    } else {
        let message = ` Invitación a un grupo:\n${text}\n\nPor: @${m.sender.split('@')[0]}`;
        await conn.sendMessage(`${suittag}` + '@s.whatsapp.net', { text: message, mentions: [m.sender] }, { quoted: m });
        m.reply(`${emoji} El link del grupo ha sido enviado, gracias por tu invitacion. `);
    }
};

handler.help = ['invite'];
handler.tags = ['owner'];
handler.command = ['invite', 'join'];

export default handler;