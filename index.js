const {app, BrowserWindow} = require("electron");

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Drawing Program",
        autoHideMenuBar: true
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