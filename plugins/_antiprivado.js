export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;
  
  // Comandos permitidos
  const comandosPermitidos = ['PIEDRA', 'PAPEL', 'TIJERA', 'serbot', 'code'];
  if (comandosPermitidos.some(cmd => m.text.includes(cmd))) return true;
  
  // Excepción para newsletters
  if (m.chat.endsWith('@newsletter')) return true;

  // Configuración
  const botConfig = global.db.data.settings[this.user.jid] || {};

  // Modo antiprivado
  if (botConfig.antiPrivate && !isOwner && !isROwner) {
    try {
      const usuario = `@${m.sender.split('@')[0]}`;
      
      const mensajeBloqueo = `
╭─── *♢ Aviso Automático ♢* ───
│
│ ✦ *Hola ${usuario}* ✦
│
│ Lamentamos informarte que los comandos
│ están desactivados en chats privados.
│
│ ⚠️ *Has sido bloqueado automáticamente*
│
│ 📌 *Para usar el bot:*
│ 1. Únete a nuestro grupo oficial
│ 2. Contacta al administrador
│
╰───「（´•̥̥̥ω•̥̥̥`）♡ 𝑆ℎ𝑖𝑧𝑢𝑘𝑎-𝐴𝐼 ♡（´•̥̥̥ω•̥̥̥`)」───

https://chat.whatsapp.com/CgQSUIsZe5HFzsrrz2XKpt?mode=ems_copy_t
     
 `.trim();

      await conn.sendMessage(m.chat, { 
        text: mensajeBloqueo,
        mentions: [m.sender]
      });

      await this.updateBlockStatus(m.chat, 'block');
      
    } catch (e) {
      console.error('Error en antiprivado:', e);
    }
  }
  
  return false;
}