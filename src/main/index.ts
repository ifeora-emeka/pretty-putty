import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import isDev from "electron-is-dev";
import { StorageManager } from "./storage.manager";
import { ConnectionIpcManager } from "./services/connection.ipc.manager";
import { ConnectionManager } from "./services/connection.manager";
import { SystemStatusIpcManager } from "./services/system-status.ipc.manager";

let mainWindow: BrowserWindow | null = null;
let storageManager: StorageManager | null = null;
let connectionIpcManager: ConnectionIpcManager | null = null;
let systemStatusIpcManager: SystemStatusIpcManager | null = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const startUrl = isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../renderer/index.html")}`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
};

app.on("ready", () => {
    storageManager = new StorageManager(isDev);
    connectionIpcManager = new ConnectionIpcManager(ConnectionManager.getInstance());
    systemStatusIpcManager = new SystemStatusIpcManager();
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.handle("get-app-version", () => app.getVersion());
