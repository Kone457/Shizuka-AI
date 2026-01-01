import fetch from 'node-fetch'
import moment from 'moment-timezone'
import { default as WA, proto, prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, args }) => {
  if (!text) return m.reply('> Ingresa una palabra clave para buscar en GitHub (repositorios, usuarios, etc).\nEjemplo: .github react framework')
  
  const [searchType, ...searchTerms] = text.split(' ')
  const searchQuery = searchTerms.join(' ') || searchType
  const type = searchTerms.length ? searchType.toLowerCase() : 'repositories'

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⌛',
        key: m.key
      }
    })

    let apiUrl
    let resultKey
    
    if (type === 'users' || type === 'user') {
      apiUrl = `https://api.github.com/search/users?q=${encodeURIComponent(searchQuery)}&per_page=10`
      resultKey = 'items'
    } else if (type === 'issues') {
      apiUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(searchQuery)}&per_page=10`
      resultKey = 'items'
    } else {
      // Default to repositories
      apiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=10`
      resultKey = 'items'
    }

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'WhatsApp-Bot-GitHub-Search',
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    const json = await res.json()

    if (!json[resultKey]?.length) {
      await conn.sendMessage(m.chat, {
        react: {
          text: '❌',
          key: m.key
        }
      })
      return m.reply(`> No se encontraron ${type === 'users' ? 'usuarios' : type === 'issues' ? 'issues' : 'repositorios'} para *${searchQuery}*`)
    }

    const tiempo = moment.tz('America/Bogota').format('DD MMM YYYY')
    const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')

    const cards = []
    const items = json[resultKey].slice(0, 10)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      let title = ''
      let description = ''
      let buttons = []
      
      if (type === 'users' || type === 'user') {
        title = `👤 ${item.login}`
        description = `ID: ${item.id}\nTipo: ${item.type}\nScore: ${item.score?.toFixed(2) || 'N/A'}`
        
        buttons = [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: `📄 Ver Perfil`,
              id: `github_profile_${item.login}`
            })
          }
        ]
        
      } else if (type === 'issues') {
        title = `📌 ${item.title.substring(0, 30)}${item.title.length > 30 ? '...' : ''}`
        description = `👤 ${item.user?.login || 'N/A'}\n📅 ${moment(item.created_at).format('DD/MM/YYYY')}\n🔗 ${item.html_url}`
        
        buttons = [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: `🔗 Ver Issue`,
              id: `github_issue_${item.number}`
            })
          }
        ]
        
      } else {
        // Repositories
        title = `📁 ${item.full_name}`
        description = `⭐ ${item.stargazers_count?.toLocaleString() || 0} | 🍴 ${item.forks_count?.toLocaleString() || 0}\n📝 ${item.description?.substring(0, 60) || 'Sin descripción'}${item.description?.length > 60 ? '...' : ''}\n🔤 ${item.language || 'N/A'}`
        
        buttons = [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: `⭐ Repositorio`,
              id: `github_repo_${item.full_name}`
            })
          }
        ]
      }

      // Try to get avatar for users or owner avatar for repos
      let headerObj
      try {
        const avatarUrl = type === 'users' ? item.avatar_url : item.owner?.avatar_url
        if (avatarUrl) {
          const imgBuffer = await (await fetch(avatarUrl)).buffer()
          const media = await prepareWAMessageMedia({ image: imgBuffer }, { upload: conn.waUploadToServer })
          headerObj = proto.Message.InteractiveMessage.Header.fromObject({ 
            hasMediaAttachment: true, 
            imageMessage: media.imageMessage 
          })
        } else {
          headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
        }
      } catch {
        headerObj = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
      }

      const card = {
        header: headerObj,
        body: proto.Message.InteractiveMessage.Body.fromObject({ 
          text: `${title}\n\n${description}` 
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ 
          text: `GitHub • ${tiempo} ${tiempo2}` 
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
          buttons: buttons.map(btn => ({
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '🔗 Abrir en GitHub',
              url: type === 'users' ? item.html_url : type === 'issues' ? item.html_url : item.html_url
            })
          }))
        })
      }

      cards.push(card)
    }

    const typeText = type === 'users' ? 'usuarios' : type === 'issues' ? 'issues' : 'repositorios'
    
    const interactive = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ 
        text: `✨ *Resultados de GitHub*\n\n🔍 *Búsqueda:* ${searchQuery}\n📂 *Tipo:* ${typeText}\n📊 *Total:* ${json.total_count?.toLocaleString() || 'N/A'} resultados` 
      }),
      footer: proto.Message.InteractiveMessage.Footer.create({ 
        text: `GitHub Search • Mostrando ${items.length} de ${json.total_count?.toLocaleString() || 'N/A'}` 
      }),
      header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
      carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
    })

    const messageContent = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: interactive
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, messageContent.message, { messageId: messageContent.key.id })

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: messageContent.key
      }
    })

  } catch (e) {
    console.error('[GitHub Carrusel] Error:', e)
    await conn.sendMessage(m.chat, {
      react: {
        text: '❌',
        key: m.key
      }
    })
    await conn.sendMessage(m.chat, { 
      text: `❌ *Error en búsqueda GitHub*\n\n${e.message || 'Error desconocido'}\n\n💡 *Sugerencias:*\n1. Verifica tu conexión a internet\n2. Asegúrate de que la API de GitHub esté disponible\n3. Intenta con una búsqueda diferente` 
    }, { quoted: m })
  }
}

handler.help = ['github']
handler.tags = ['buscadores', 'internet']
handler.command = ['github', 'gitsearch']


export default handler