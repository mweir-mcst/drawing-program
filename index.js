const fs = require("fs");
const path = require("path");

const {app, BrowserWindow, ipcMain} = require("electron");
const {download} = require("electron-dl");

ipcMain.on("download", async (e, url) => {
    const win = BrowserWindow.getFocusedWindow();
    let name = "image";
    let diff = 0;
    while (fs.existsSync(path.join(process.env.USERPROFILE, "Pictures", `${name}.png`))) {
        name = `image (${++diff})`;
    }
    const dl = await download(win, url, {
        filename: `${name}.png`,
        directory: path.join(process.env.USERPROFILE, "Pictures")
    });
    win.webContents.send("downloadComplete", dl.getSavePath());
});

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Drawing Program",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    await win.loadFile("index.html");
}

app.on("window-all-closed", () => {
   if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(async () => {
    await createWindow();

    app.on("activate", async () => {
       if (BrowserWindow.getAllWindows().length === 0) await createWindow();
    });
})