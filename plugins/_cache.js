let handler = m => m

handler.before = async function (m, { conn }) {
    let user = globalThis.db.data.users[m.sender]

    if (!user) {
       user.name = m.pushName || m.name
    }

    let currentNick = m.pushName || conn.getName(m.sender)

    if (user.name !== currentNick) {
        user.name = currentNick
    } else {
    }

  // return true
}

export default handler