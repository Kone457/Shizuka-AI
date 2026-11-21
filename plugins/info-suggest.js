import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(
            m.chat,
            `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼💡 الاقتراحات 💡╮
┃֪࣪
├ׁ̟̇❍✎ ✖️ طريقة الاستخدام
├ׁ̟̇❍✎ ${usedPrefix + command}
┃֪࣪
├ׁ̟̇❍✎ الأمر ده بيبعت
├ׁ̟̇❍✎ اقتراحات أو أفكار للبوت
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`,
            m
        )
    }

    if (text.length < 10)
        return conn.reply(
            m.chat,
            `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
├ׁ̟̇❍✎ ⚠️ خطأ
├ׁ̟̇❍✎ 10 حروف على الأقل
├ׁ̟̇❍✎ اشرح اقتراحك أوضح
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`,
            m
        )

    if (text.length > 1000)
        return conn.reply(
            m.chat,
            `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
├ׁ̟̇❍✎ ⚠️ خطأ
├ׁ̟̇❍✎ الحد الأقصى 1000 حرف
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`,
            m
        )

    const teks = `╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼💡 اقتراح جديد 💡╮
┃֪࣪
├ׁ̟̇❍✎ 📱 الرقم:
├ׁ̟̇❍✎ wa.me/${m.sender.split('@')[0]}
┃֪࣪
├ׁ̟̇❍✎ 👤 المستخدم:
├ׁ̟̇❍✎ ${m.pushName || 'Anónimo'}
┃֪࣪
├ׁ̟̇❍✎ 💬 Sugerencia:
├ׁ̟̇❍✎ ${text}
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`

    try {
        await fetch('https://discord.com/api/webhooks/1482041314701738066/CfeGZsaaEEzOYPWS0xFWqiN2yQqEYbpnszIB1x2Vc9GrDTN_Q2huKCdTgq2ozkyBhi0w', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [{
                    description: teks,
                    color: 0x00AEEF
                }]
            })
        })

        m.reply(
`╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
╭╼💡 تم إرسال الاقتراح 💡╮
┃֪࣪
├ׁ̟̇❍✎ 📨 اقتراحك اتبعت
├ׁ̟̇❍✎ للمطور بنجاح
┃֪࣪
├ׁ̟̇❍✎ ✨ شكراً على مساعدتك
├ׁ̟̇❍✎ في تحسين البوت
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`
        )
    } catch (e) {
        console.error(e)

        m.reply(
`╭─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╮
├ׁ̟̇❍✎ ❌ خطأ
├ׁ̟̇❍✎ مقدرتش أبعت
├ׁ̟̇❍✎ الاقتراح
╰─ׅ─ׅ┈ ─๋︩︪─❖─๋︩︪─┈─ׅ─ׅ╯`
        )
    }
}

handler.help = ['فكرة']
handler.tags = ['tools']
handler.command = ['suggest', 'suggestion', 'sugerencia', 'sugerir', 'فكرة', 'اقتراح']

export default handler