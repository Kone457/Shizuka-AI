let handler = async (m, { conn }) => {
    try {
        // Obtener todos los chats
        const chats = Array.from(conn.chats.values())  
        const groups = chats.filter(c => c.jid.endsWith('@g.us'))

        if (!groups.length) return m.reply('🤔 No estoy en ningún grupo.')

        let text = `🌐 *Lista de grupos donde estoy:*\n\n`

        for (let group of groups) {
            try {
                const metadata = await conn.groupMetadata(group.jid)
                const participants = metadata.participants
                const admins = participants.filter(p => p.admin || p.isAdmin).map(p => p.id)

                // Intentar obtener link de invitación si el bot es admin
                let inviteLink = '❌ No soy admin, no puedo generar link'
                const me = participants.find(p => p.id === conn.user.jid)
                if (me?.admin || me?.isAdmin) {
                    try {
                        const code = await conn.groupInviteCode(metadata.id)
                        inviteLink = `https://chat.whatsapp.com/${code}`
                    } catch {
                        inviteLink = '❌ Error obteniendo el link'
                    }
                }

                text += `
📌 *Nombre:* ${metadata.subject}
🆔 *JID:* ${metadata.id}
👥 *Participantes:* ${participants.length}
🛡️ *Admins:* ${admins.join(', ') || 'Ninguno'}
💬 *Descripción:* ${metadata.desc || 'Sin descripción'}
🔗 *Link:* ${inviteLink}
-----------------------------------
`
            } catch (e) {
                text += `📌 Grupo desconocido: ${group.jid}\n-----------------------------------\n`
            }
        }

        await conn.sendMessage(m.chat, { text }, { quoted: m })
    } catch (err) {
        console.error(err)
        m.reply('❌ Ocurrió un error al obtener los grupos.')
    }
}

handler.help = ['listgrupos']
handler.tags = ['info']
handler.command = ['listgrupos', 'listagrupos', 'grupos']

export default handler