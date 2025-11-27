/*
 # Código React Channel

 # Creditos al Código: https://whatsapp.com/channel/0029VbBtMA89sBI8lwSr5M2H
 # Saca tu Apikey Aquí: api.stellarwa.xyz
*/

import fetch from "node-fetch"

export default {
  command: ["react"],
  run: async (client, m, args) => {
    try {
      const key = "stellar-EBo93V1d"
      const url = args[0]
      const emogis = args.slice(1).join(" ")

      if (!url || !emogis) {
        return m.reply("🚩 Uso correcto: /react https://whatsapp.com/channel/0029VbApwZ9ISTkEBb6ttS3F/01918 🍃, 🌱, 🥳, 🤣")
      }

      const lista = emogis.split(",").map(e => e.trim()).filter(e => e)
      if (lista.length === 0 || lista.length > 4) {
         m.react('⚠️')
        return m.reply("🚩 Debes ingresar entre 1 y 4 emojis separados por coma")
      }

      const reactParam = lista.join(", ")
      const apiUrl = `https://api.stellarwa.xyz/whatsapp/react-ch?url=${url}&react=${reactParam}&key=${key}`
       m.react('⏱️')

      const res = await fetch(apiUrl)
      if (!res.ok) {
       m.react('❗')
      return m.reply("🚩 Error al conectar con la API")
      }

      const json = await res.json()
      if (!json.status) {
       m.react('❌')
     return m.reply("🚩 No se pudo enviar la reacción")
      }

       m.react('🎡')
       return m.reply(`🌾 Reacción Enviada Correctamente!`)

    } catch (err) {
      console.error(err)
       m.react('❌')
      return m.reply("🚩 Ocurrió un error inesperado")
    }
  },
}