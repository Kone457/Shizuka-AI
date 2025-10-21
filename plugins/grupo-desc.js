let handler = async (m, { conn, args }) => {
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://qu.ax/fgsws.jpg')
await conn.groupUpdateDescription(m.chat, `${args.join(" ")}`);
m.react("✅️")
}
handler.help = ['groupdesc'];
handler.tags = ['group'];
handler.command = /^setdesk|groupdesc|newdesc|descripción|descripcion$/i
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
