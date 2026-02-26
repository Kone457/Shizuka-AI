import { resolveLidToRealJid } from "../lib/utils.js"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default {
  command: ['setprimary'],
  category: 'grupo',
  isAdmin: true,

  run: async (client, m, args) => {
    try {
      const chat = global.db.data.chats[m.chat]
      const mentioned = m.mentionedJid
      const who2 = mentioned.length > 0 ? mentioned[0] : m.quoted?.sender || false
      
      if (!who2) {
        return client.reply(m.chat, `Por favor menciona un bot para convertirlo en primario.`, m)
      }

      const who = await resolveLidToRealJid(who2, client, m.chat);
      const mainBotJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
      
      const activeBots = (global.conns || [])
        .filter(conn => conn.user)
        .map(conn => conn.userId + '@s.whatsapp.net')
      
      const allowedBots = [...new Set([mainBotJid, ...activeBots])]

      if (!allowedBots.includes(who)) {
        return client.reply(m.chat, `El usuario mencionado no es una instancia de Sub-Bot activa.`, m)
      }

      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => {}) : null
      const groupParticipants = groupMetadata?.participants?.map((p) => p.id) || []

      if (!groupParticipants.includes(who)) {
        return client.reply(m.chat, `《✧》 El bot mencionado no está presente en este grupo.`, m)
      }

      if (chat.primaryBot === who) {
        return client.reply(m.chat, ` @${who.split('@')[0]} ya es el Bot principal del Grupo.`, m, {
          mentions: [who],
        })
      }

      chat.primaryBot = who
      await client.reply(
        m.chat,
        ` Se ha establecido a @${who.split('@')[0]} como bot primario de este grupo.\n> Ahora todos los comandos de este grupo serán ejecutados por @${who.split('@')[0]}.`,
        m,
        { mentions: [who] },
      )
    } catch (e) {
      console.error(e)
      await m.reply(` Ocurrió un error al intentar establecer el bot primario.`)
    }
  },
};
