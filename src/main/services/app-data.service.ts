import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { AppData, StoredConnection, AppPreferences } from "../types.storage";

export class AppDataStore {
  private dataPath: string;
  private dataFile: string;
  private data: AppData;

  constructor(isDev: boolean = false) {
    const userData = app.getPath("userData");
    this.dataPath = isDev
      ? path.join(process.cwd(), ".app-data-dev")
      : path.join(userData, ".app-data");

    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }

    this.dataFile = path.join(this.dataPath, "app-data.json");
    this.data = this.loadData();
  }

  private loadData(): AppData {
    try {
      if (fs.existsSync(this.dataFile)) {
        const content = fs.readFileSync(this.dataFile, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.error("Failed to load app data:", error);
    }

    return {
      connections: [],
      preferences: {},
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save app data:", error);
      throw new Error(`Failed to save app data: ${error}`);
    }
  }

  addConnection(connection: StoredConnection): void {
    const exists = this.data.connections.some((c) => c.id === connection.id);
    if (exists) {
      const index = this.data.connections.findIndex((c) => c.id === connection.id);
      this.data.connections[index] = connection;
    } else {
      this.data.connections.push(connection);
    }
    this.saveData();
  }

  getConnection(connectionId: string): StoredConnection | undefined {
    return this.data.connections.find((c) => c.id === connectionId);
  }

  getAllConnections(): StoredConnection[] {
    return [...this.data.connections];
  }

  removeConnection(connectionId: string): void {
    this.data.connections = this.data.connections.filter((c) => c.id !== connectionId);
    this.saveData();
  }

  updateLastConnected(connectionId: string): void {
    const connection = this.data.connections.find((c) => c.id === connectionId);
    if (connection) {
      connection.lastConnected = new Date().toISOString();
      this.saveData();
    }
  }

  setPreference<K extends keyof AppPreferences>(key: K, value: AppPreferences[K]): void {
    this.data.preferences[key] = value;
    this.saveData();
  }

  getPreference<K extends keyof AppPreferences>(key: K): AppPreferences[K] | undefined {
    return this.data.preferences[key];
  }

  getAllPreferences(): AppPreferences {
    return { ...this.data.preferences };
  }

  clearAllData(): void {
    this.data = {
      connections: [],
      preferences: {},
    };
    this.saveData();
  }

  exportData(): AppData {
    return JSON.parse(JSON.stringify(this.data));
  }
}
