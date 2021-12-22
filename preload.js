const {contextBridge, ipcRenderer} = require("electron");

window.download = function(url) {
    ipcRenderer.send("download", url);
    return new Promise(resolve => {
        ipcRenderer.once("downloadComplete", (e, path) => {
            resolve(path);
        });
    });
};

contextBridge.exposeInMainWorld("download", window.download);