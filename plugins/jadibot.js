import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from "fs";
const fs = { ...fsPromises, existsSync };
import path, { join } from 'path';
import ws from 'ws';
import os from 'os';

let handler = async (m, { conn: _envio, command, usedPrefix, args, text, isOwner }) => {
  const isCommand1 = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command);
  const isCommand2 = /^(stop|pausarai|pausarbot)$/i.test(command);
  const isCommand3 = /^(bots|sockets|socket)$/i.test(command);

  // Emojis para una mejor presentación
  const emojis = {
    check: '✅',
    x: '❌',
    info: 'ℹ️',
    warning: '⚠️',
    rocket: '🚀',
    robot: '🤖',
    wave: '👋',
    start: '┏━━❲ ✨S H I Z U K A - A I✨ ❳━━',
    end: '┗━━━━━━━━━━━━━━━━━━━━━━━'
  };

  /**
   * Envía un mensaje de error detallado en caso de fallo.
   * @param {Error} e - El objeto de error.
   */
  async function reportError(e) {
    const errorMsg = `
${emojis.start}
${emojis.x} Ocurrió un error inesperado.
    
Por favor, inténtelo de nuevo más tarde o contacte al soporte.
${emojis.end}
    `;
    await m.reply(errorMsg);
    console.error(e);
  }

  // --- Lógica del comando ---
  switch (true) {
    case isCommand1:
      try {
        const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? _envio.user.jid : m.sender;
        const uniqid = who.split('@')[0];
        const sessionPath = `./${jadi}/${uniqid}`;

        if (!fs.existsSync(sessionPath)) {
          const notFoundMsg = `
${emojis.start}
${emojis.info} *Sesión no encontrada*

No tienes una sesión activa. Puedes crear una usando el comando:
\`${usedPrefix}serbot\`

Si tienes un ID, puedes usar:
\`${usedPrefix}serbot <ID>\`
${emojis.end}
          `;
          await _envio.sendMessage(m.chat, { text: notFoundMsg }, { quoted: m });
          return;
        }

        if (global.conn.user.jid !== _envio.user.jid) {
          const mainBotMsg = `
${emojis.start}
${emojis.warning} *Comando no disponible aquí*

Este comando solo puede ser usado en el bot principal. Si eres un Sub-Bot, tu sesión no puede ser eliminada desde aquí.

Para eliminar tu sesión, contacta al bot principal en:
https://api.whatsapp.com/send/?phone=${global.conn.user.jid.split('@')[0]}&text=${usedPrefix + command}
${emojis.end}
          `;
          await _envio.sendMessage(m.chat, { text: mainBotMsg }, { quoted: m });
          return;
        }

        await _envio.sendMessage(m.chat, {
          text: `
${emojis.start}
${emojis.wave} Entendido.
    
Eliminando tu sesión como Sub-Bot. Esto puede tardar unos segundos...
${emojis.end}
          `
        }, { quoted: m });

        await fs.rm(sessionPath, { recursive: true, force: true });
        
        const successMsg = `
${emojis.start}
${emojis.check} ¡Sesión eliminada con éxito!
    
Has cerrado sesión y se han borrado todos los archivos relacionados.
${emojis.end}
        `;
        await _envio.sendMessage(m.chat, { text: successMsg }, { quoted: m });

      } catch (e) {
        reportError(e);
      }
      break;

    case isCommand2:
      if (global.conn.user.jid === _envio.user.jid) {
        const notSubBotMsg = `
${emojis.start}
${emojis.info} *Comando para Sub-Bots*

Este comando es exclusivo para los Sub-Bots. Si no eres un Sub-Bot, no es necesario que lo uses.
${emojis.end}
        `;
        _envio.reply(m.chat, notSubBotMsg, m);
      } else {
        const closedMsg = `
${emojis.start}
${emojis.robot} ¡Desactivado!
    
Tu conexión como Sub-Bot se ha cerrado temporalmente.
${emojis.end}
        `;
        await _envio.reply(m.chat, closedMsg, m);
        _envio.ws.close();
      }
      break;

    case isCommand3:
      // if (global.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`${emojis.x} Este comando ha sido desactivado por el creador.`);

      const activeBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])];

      function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        const parts = [];
        if (days) parts.push(`${days} día${days > 1 ? 's' : ''}`);
        if (hours % 24) parts.push(`${hours % 24} hora${(hours % 24) > 1 ? 's' : ''}`);
        if (minutes % 60) parts.push(`${minutes % 60} minuto${(minutes % 60) > 1 ? 's' : ''}`);
        if (seconds % 60) parts.push(`${seconds % 60} segundo${(seconds % 60) > 1 ? 's' : ''}`);

        return parts.length ? parts.join(', ') : 'Menos de un segundo';
      }

      const totalMemory = (os.totalmem() / 1024 ** 3).toFixed(2);
      const freeMemory = (os.freemem() / 1024 ** 3).toFixed(2);
      const usedMemory = (totalMemory - freeMemory).toFixed(2);
      
      const botList = activeBots.map((bot, index) => {
        return `
${index + 1}. ✨
*• Bot:* ${bot.user.name || 'Sub-Bot'}
*• ID:* \`${bot.user.jid.split('@')[0]}\`
*• Enlace:* Wa.me/${bot.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado
*• Uptime:* ${bot.uptime ? formatTime(Date.now() - bot.uptime) : 'Desconocido'}
*• Estado:* Activo
        `;
      }).join('\n' + '-'.repeat(30) + '\n');
      
      const totalBots = activeBots.length;
      
      const responseMessage = `
${emojis.start}
${emojis.robot} *ESTADO DE SUB-BOTS*
    
*Información del Servidor:*
- ${emojis.info} *RAM Utilizada:* ${usedMemory} GB / ${totalMemory} GB
- ${emojis.info} *Sub-Bots Conectados:* ${totalBots}

${'-'.repeat(30)}

${emojis.robot} *LISTA DE SUB-BOTS ACTIVOS (${totalBots}):*
${botList || `${emojis.x} No hay Sub-Bots disponibles en este momento. Intente más tarde.`}

${'-'.repeat(30)}

${emojis.warning} *Aviso Importante:*
Cada Sub-Bot es gestionado por su respectivo usuario. El bot principal no se hace responsable por el mal uso de sus funciones.
${emojis.end}
      `.trim();
      
      await _envio.sendMessage(m.chat, {
        text: responseMessage,
        mentions: _envio.parseMention(responseMessage)
      }, { quoted: m });
      break;
  }
};

handler.tags = ['serbot'];
handler.help = ['sockets', 'deletesesion', 'pausarai'];
handler.command = ['deletesesion', 'deletebot', 'deletesession', 'stop', 'pausarai', 'pausarbot', 'bots', 'sockets', 'socket'];

export default handler;
