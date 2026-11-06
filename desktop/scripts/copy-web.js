// ينسخ ملفات الويب من المجلد الأب إلى desktop/app قبل التشغيل/البناء
const fs = require("fs"), path = require("path");
const src = path.join(__dirname, "..", ".."), dst = path.join(__dirname, "..", "app");
const FILES = ["index.html", "community.json", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];
fs.rmSync(dst, { recursive: true, force: true });
fs.mkdirSync(dst, { recursive: true });
for (const f of FILES) {
  const from = path.join(src, f);
  if (!fs.existsSync(from)) throw new Error("ملف ناقص: " + f);
  fs.copyFileSync(from, path.join(dst, f));
}
console.log("web files copied:", FILES.length);
