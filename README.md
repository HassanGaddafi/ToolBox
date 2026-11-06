# 🧰 Toolbox — صندوق الأدوات

صفحة واحدة تجمع مواقعك وأدواتك: ضغطة على الكارت تفتح الموقع، بحث بالكلمات، وقائمة مجتمع، وبحث ذكي بالوصف (اختياري).

## 1) النشر على GitHub Pages
1. أنشئ repo وارفع `index.html` و`community.json` و`README.md` (مجلد `worker/` اختياري، ويمكن رفعه أو إبقاؤه محليًا).
2. Settings → Pages → Source: `main` / root → Save.
3. يعمل الموقع على `https://<username>.github.io/<repo>/`.

## 2) تفعيل البحث الذكي والوصف التلقائي (Cloudflare Worker)
المتطلبات: حساب Cloudflare مجاني، ومفتاح API من console.anthropic.com، و Node.js.

```bash
cd worker
npm i -g wrangler
wrangler login
# عدّل ALLOWED_ORIGIN في wrangler.toml إلى https://<username>.github.io
wrangler secret put ANTHROPIC_API_KEY     # الصق المفتاح هنا (لا تكتبه في أي ملف)
wrangler deploy
```
سيعطيك الأمر رابطًا مثل `https://toolbox-ai.<name>.workers.dev`. افتح `index.html` وضعه هنا:
```js
var WORKER="https://toolbox-ai.<name>.workers.dev";
```
ثم ارفع `index.html` المعدّل. سيظهر زر **✨ بحث ذكي** و**✨ وصف تلقائي**.

### الأمان والتكلفة (مهم)
- المفتاح محفوظ كـ Secret في Cloudflare ولا يظهر في الصفحة.
- الـ Worker يقبل الطلبات من `ALLOWED_ORIGIN` فقط، لكن هذا فحص للمتصفح وليس مصادقة؛ يستطيع أي شخص يعرف الرابط إرسال طلبات بسكربت. لذلك:
  1. حدّد **Spend limit** شهريًا لمفتاحك في Anthropic Console.
  2. فعّل Rate Limiting: إما binding `LIMITER` (انظر الأسطر المعلّقة في `wrangler.toml` وراجع توثيق Cloudflare للصيغة الحالية)، أو Rate Limiting Rule من لوحة Cloudflare.
- الـ Worker يحدّ طول الطلب (12000 حرف) و`max_tokens` (900) ويستخدم نموذجًا سريعًا ورخيصًا افتراضيًا (`claude-haiku-5-5`، غيّره عبر `MODEL`).

## 3) قائمة المجتمع
أي شخص يضيف موقعًا بإرسال Pull Request يعدّل `community.json`:
```json
{ "url": "https://example.com", "name": "Example", "desc": "وصف من سطر واحد", "cat": "أمن" }
```
قائمتك الشخصية تبقى في متصفحك (localStorage) ويمكن تصديرها واستيرادها كـ JSON.

## 4) تثبيته كتطبيق (PWA) بدون اختصارات على سطح المكتب
الملفات المطلوبة موجودة: `manifest.json` و`sw.js` والأيقونات. ارفعها كلها بجانب `index.html` في نفس المجلد.
يشترط أن يكون الموقع على HTTPS (GitHub Pages يوفر ذلك).

- **Chrome / Edge (ويندوز، ماك، لينكس):** اضغط زر **⬇ تثبيت التطبيق** في الصفحة، أو أيقونة التثبيت في شريط العنوان. سيظهر التطبيق في قائمة Start / Launchpad / قائمة التطبيقات وتفتحه بالبحث أو بتثبيته في شريط المهام. قد يعرض المتصفح خيار «إنشاء اختصار على سطح المكتب»؛ ألغِ علامته إن لم تردّه.
- **أندرويد (Chrome):** قائمة ⋮ ← «تثبيت التطبيق».
- **iPhone / iPad (Safari):** مشاركة ← «إضافة إلى الشاشة الرئيسية».
- **Safari على ماك:** File ← Add to Dock.

بعد التثبيت يعمل التطبيق في نافذة مستقلة وبدون إنترنت (قائمتك محفوظة محليًا؛ البحث الذكي يحتاج إنترنت).
عند نشر تحديث جديد، غيّر `V = "toolbox-v1"` في `sw.js` إلى `toolbox-v2` لإجبار تحديث الكاش.

## 5) نسخة سطح المكتب (.exe لويندوز)
مجلد `desktop/` يحتوي تطبيق Electron يغلّف نفس الصفحة، والملف `.github/workflows/build-exe.yml` يبنيه تلقائيًا على خوادم GitHub (لا تحتاج ويندوز ولا تثبيت أي شيء عندك).

**البناء السحابي (الأسهل):**
1. ارفع المشروع كله (مع المجلد المخفي `.github`) إلى GitHub.
2. تبويب **Actions ← Build Windows EXE ← Run workflow**.
3. بعد دقائق، من صفحة التشغيل نزّل **Artifacts ← toolbox-windows**: فيه `Toolbox-Setup-1.0.0.exe` (مثبّت) و`Toolbox-Portable-1.0.0.exe` (بدون تثبيت).
4. للنشر كـ Release: `git tag v1.0.0 && git push --tags` وسيُرفق الملفان تلقائيًا.

**البناء على جهازك:** `cd desktop && npm ci && npm run dist` (الناتج في `desktop/dist`). للتجربة بدون بناء: `npm start`.

**ملاحظات:**
- المثبّت لا ينشئ اختصارًا على سطح المكتب (فقط قائمة Start)، حسب طلبك.
- الملف غير موقّع رقميًا، فيعرض ويندوز تحذير SmartScreen: اضغط **More info ← Run anyway**. التوقيع يحتاج شهادة Code Signing مدفوعة.
- مواقعك تُفتح في متصفحك الافتراضي، وقائمتك تُحفظ في بيانات التطبيق على جهازك.
- لتفعيل البحث الذكي في التطبيق: ضع رابط الـ Worker في `WORKER` داخل `index.html`، وتأكد أن `ALLOWED_ORIGIN` في `wrangler.toml` يحتوي `app://toolbox` (مضاف افتراضيًا)، ثم أعد `wrangler deploy`.
- لتحديث التطبيق: عدّل `version` في `desktop/package.json` ثم أعد البناء.
