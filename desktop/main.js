const { app, BrowserWindow, protocol, net, shell, Menu, session } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.join(__dirname, "app");
const ORIGIN = "app://toolbox";

// بروتوكول app:// بدل file:// ليكون للتطبيق Origin ثابت (تخزين محلي مستقر، وCORS للـ Worker)
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

const isWeb = (u) => /^https?:\/\//i.test(u);

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  let win;
  app.on("second-instance", () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  app.whenReady().then(() => {
    protocol.handle("app", (req) => {
      let p = decodeURIComponent(new URL(req.url).pathname);
      if (p === "/" || p === "") p = "/index.html";
      const file = path.normalize(path.join(ROOT, p));
      if (!file.startsWith(ROOT + path.sep)) return new Response("forbidden", { status: 403 });
      return net.fetch(pathToFileURL(file).toString());
    });

    // لا صلاحيات (كاميرا/موقع/إشعارات...) لأي صفحة
    session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
    Menu.setApplicationMenu(null);

    win = new BrowserWindow({
      width: 1100, height: 760, minWidth: 420, minHeight: 500,
      title: "صندوق الأدوات",
      backgroundColor: "#0e1117",
      icon: path.join(__dirname, "build", "icon.png"),
      autoHideMenuBar: true,
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
    });

    // مواقعك تفتح في المتصفح الافتراضي، لا داخل التطبيق
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (isWeb(url)) shell.openExternal(url);
      return { action: "deny" };
    });
    win.webContents.on("will-navigate", (e, url) => {
      if (!url.startsWith(ORIGIN + "/")) { e.preventDefault(); if (isWeb(url)) shell.openExternal(url); }
    });

    if (process.env.TOOLBOX_SMOKE) {   // اختبار سريع للمطوّر فقط
      win.webContents.once("did-finish-load", async () => {
        await new Promise((r) => setTimeout(r, 800));
        const out = await win.webContents.executeJavaScript(
          `fetch("community.json").then(r=>r.status).then(s=>JSON.stringify({origin:location.origin,cards:document.querySelectorAll(".c").length,communityStatus:s,title:document.title}))`
        );
        console.log("SMOKE", out); app.quit();
      });
    }
    win.loadURL(ORIGIN + "/index.html");
  });

  app.on("window-all-closed", () => app.quit());
}
