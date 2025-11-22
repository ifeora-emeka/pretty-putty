import { Client, ClientChannel, SFTPWrapper } from "ssh2";
import { EventEmitter } from "events";

export interface SSHConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface SSHConnectionEvents {
  ready: () => void;
  error: (error: Error) => void;
  close: () => void;
  end: () => void;
}

export class SSHConnectionService extends EventEmitter {
  private client: Client;
  private sftpClient: SFTPWrapper | null = null;
  private config: SSHConnectionConfig;
  private isConnected = false;
  private connectionId: string;

  constructor(connectionId: string, config: SSHConnectionConfig) {
    super();
    this.connectionId = connectionId;
    this.config = config;
    this.client = new Client();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on("ready", () => {
      this.isConnected = true;
      this.emit("ready");
    });

    this.client.on("error", (err: Error) => {
      this.isConnected = false;
      this.emit("error", err);
    });

    this.client.on("close", () => {
      this.isConnected = false;
      this.sftpClient = null;
      this.emit("close");
    });

    this.client.on("end", () => {
      this.isConnected = false;
      this.emit("end");
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.client.end();
        reject(new Error("Connection timeout after 30 seconds"));
      }, 30000);

      this.client.once("ready", () => {
        clearTimeout(timeout);
        resolve();
      });

      this.client.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      this.client.connect({
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
        readyTimeout: 30000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3,
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isConnected) {
        resolve();
        return;
      }

      this.client.once("close", () => {
        resolve();
      });

      this.client.end();

      setTimeout(() => {
        this.client.destroy();
        resolve();
      }, 5000);
    });
  }

  async executeCommand(command: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error("SSH client not connected");
    }

    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream: ClientChannel) => {
        if (err) return reject(err);

        let stdout = "";
        let stderr = "";

        stream.on("data", (data: Buffer) => {
          stdout += data.toString();
        });

        stream.stderr.on("data", (data: Buffer) => {
          stderr += data.toString();
        });

        stream.on("close", (code: number) => {
          if (code !== 0 && stderr) {
            reject(new Error(`Command failed with code ${code}: ${stderr}`));
          } else {
            resolve(stdout);
          }
        });

        stream.on("error", reject);
      });
    });
  }

  async getSFTPClient(): Promise<SFTPWrapper> {
    if (this.sftpClient) {
      return this.sftpClient;
    }

    if (!this.isConnected) {
      throw new Error("SSH client not connected");
    }

    return new Promise((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) return reject(err);
        this.sftpClient = sftp;
        resolve(sftp);
      });
    });
  }

  getClient(): Client {
    return this.client;
  }

  getConnectionId(): string {
    return this.connectionId;
  }

  isActive(): boolean {
    return this.isConnected;
  }

  getConfig(): SSHConnectionConfig {
    return { ...this.config };
  }
}
