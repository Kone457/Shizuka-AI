# Shizuka-AI — دليل سريع

بوت واتساب (Baileys v7، ESM، ~179 plugin). الواجهة كلها **عربية**.

## تشغيل

```bash
npm install
npm start          # أو: node index.js
npm test           # node --test "test/**/*.test.mjs"
```

## هيكل مهم

- `handler.js` — يستقبل الرسائل، يطابق الأمر مع `plugin.command`، ويشغّل الـplugin.
- `plugins/*.js` — كل أمر في ملف. كل ملف يصدّر `handler` فيه `command` و`help` و`tags`.
- `lib/simple.js` — طبقة الرسائل (`sendButton`, `reply`, إلخ).
- `lib/reaction.json` — نصوص تفاعلات الأنمي/NSFW.
- `lib/unscramble.json` — كلمات لعبة ترتيب الحروف.
- `plugins/info-menu.js` — القائمة؛ تبني الأقسام من `handler.tags` عبر `CATEGORY_META`.

## قواعد التعريب (مهمة لأي إضافة جديدة)

1. **كل نص للمستخدم بالعربي المصري** — مفيش إسباني.
2. **أسماء الأوامر**: الاسم اللاتيني الأصلي + مرادف عربي في نفس المصفوفة:
   ```js
   handler.command = ['kick', 'طرد']
   handler.help = ['طرد']   // القائمة تعرض العربي
   ```
   - المرادف العربي **كلمة واحدة بدون مسافات** (الـhandler يقسم الرسالة على المسافات).
   - لازم يكون **فريد** على مستوى كل الـplugins، وإلا الأمر يتنفّذ مرتين.
3. **لو الكود بيفرّق بين أسماء الأوامر** (مثل `switch (command)`)، اقبل العربي واللاتيني:
   ```js
   if (['close', 'قفل'].includes(command)) { ... }
   ```
4. **مفاتيح `.on/.off`** في `plugins/group-on_off.js`: ضيف `case` عربي جانب اللاتيني.
5. **مفاتيح `handler.tags` تفضل لاتينية** (تُستخدم كـids في `CATEGORY_META`)، والتسمية العربية في `CATEGORY_META`.
6. مفاتيح JSON الداخلية (mime types، أسماء الحقول، أسماء الأقسام) **متتعرّبش**.

## اختبار سريع

```bash
node --check plugins/<file>.js                      # صحة الصياغة
node -e "import('./plugins/x.js').then(m=>console.log(m.default.command))"
```
