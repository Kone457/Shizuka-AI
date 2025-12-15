import { search, download } from 'aptoide-scraper';

let handler = async(m, { conn, text }) => {
    if (!text) return m.reply('❦ Por favor, proporciona el nombre de una aplicación');

    try {
        let dta = await conn.reply(m.chat, `Buscando la aplicación . . .`, m);
        let results = await search(text);

        if (!results || results.length === 0) {
            return conn.sendMessage(m.chat, {
                text: "No se encontraron resultados.",
                edit: dta.key   
            }, {
                quoted: m
            });
        }
        let appInfo = results[0];
        let apkInfo = await download(appInfo.id);

        if (!apkInfo) {
            return conn.sendMessage(m.chat, {
                text: "No se pudo obtener la información de la aplicación.",
                edit: dta.key   
            }, {
                quoted: m
            });
        }

        const { name, package: id, size, icon: image, dllink: downloadUrl, lastup } = apkInfo;

        let caption = `    乂 \`ᗩᑭK - ᗪOᗯᑎᒪOᗩᗪᗴᖇ\`\n\n`
        caption += `≡ Nombre : ${name}\n`
        caption += `≡ ID : ${id}\n`
        caption += `≡ Tamaño : ${size}\n`
        caption += `≡ Última Actualización : ${lastup}\n\n`
        caption += footer
        
            await conn.sendMessage(m.chat, {
                image: { url: image },
                caption: caption
            }, {
                quoted: m
            });

        const sizeBytes = parseFloat(size) * 1024 * 1024; 

        if (sizeBytes > 524288000) {
            return conn.sendMessage(m.chat, {
                text: `\`El archivo es demasiado grande (${size})\`\n` +
                    `\`Descárgalo directamente desde aquí :\`\n${downloadUrl}`
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, {
            document: {
                url: downloadUrl
            },
            fileName: `${name}.apk`,
            mimetype: 'application/vnd.android.package-archive'
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.reply(`Ocurrió un error al procesar la solicitud. Por favor, intenta de nuevo :\n\n` + error);
    }
}
handler.command = handler.help = ["apk"]
handler.tags = ["descargas"]
export default handler