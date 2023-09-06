const { ipcRenderer, contextBridge } = require('electron');
const os = require('os');

contextBridge.exposeInMainWorld('electron', {
  osType: () => os.platform(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
});
