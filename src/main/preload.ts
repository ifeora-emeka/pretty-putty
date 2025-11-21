import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
    on: (channel: string, handler: (event: unknown, args: unknown) => void) =>
      ipcRenderer.on(channel, handler),
    off: (
      channel: string,
      handler: (event: unknown, args: unknown) => void
    ) => ipcRenderer.off(channel, handler),
    send: (channel: string, ...args: unknown[]) =>
      ipcRenderer.send(channel, ...args),
  },
});
