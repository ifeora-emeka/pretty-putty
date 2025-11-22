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
  }

  async connect(): Promise<void> {
    console.log("[SSHConnectionService] connect() called");
    console.log("[SSHConnectionService] Connection details:", {
      connectionId: this.connectionId,
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      hasPassword: !!this.config.password,
      passwordLength: this.config.password?.length || 0,
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error("[SSHConnectionService] Connection timeout (30s) - closing client");
        this.client.end();
        reject(new Error("Connection timeout after 30 seconds"));
      }, 30000);

      this.client.once("ready", () => {
        console.log("[SSHConnectionService] SSH 'ready' event - connection established");
        clearTimeout(timeout);
        this.isConnected = true;
        this.emit("ready");
        resolve();
      });

      this.client.once("error", (err) => {
        console.error("[SSHConnectionService] SSH connection error:", {
          code: (err as any).code,
          message: err.message,
          errno: (err as any).errno,
          level: (err as any).level,
        });
        clearTimeout(timeout);
        this.isConnected = false;
        this.emit("error", err);
        reject(err);
      });

      this.client.once("close", () => {
        console.log("[SSHConnectionService] SSH connection closed");
        this.isConnected = false;
        this.sftpClient = null;
        this.emit("close");
      });

      this.client.once("end", () => {
        console.log("[SSHConnectionService] SSH connection ended");
        this.isConnected = false;
        this.emit("end");
      });

      this.client.on("keyboard-interactive", (name, instructions, lang, prompts, finish) => {
        console.log("[SSHConnectionService] Keyboard-interactive auth triggered");
        console.log("[SSHConnectionService] Name:", name);
        console.log("[SSHConnectionService] Instructions:", instructions);
        console.log("[SSHConnectionService] Prompts:", prompts);
        finish(prompts.map(() => this.config.password));
      });

      this.client.on("banner", (message) => {
        console.log("[SSHConnectionService] Server banner:", message);
      });

      this.client.on("handshake", (negotiated) => {
        console.log("[SSHConnectionService] SSH handshake completed:", negotiated);
      });

      this.client.on("greeting", (greeting) => {
        console.log("[SSHConnectionService] Server greeting:", greeting);
      });

      const connectConfig = {
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        tryKeyboard: true,
        readyTimeout: 30000,
        keepaliveInterval: 10000,
        keepaliveCountMax: 3,
        debug: (info: string) => {
          console.log("[SSHConnectionService] SSH2 DEBUG:", info);
        },
      };

      console.log("[SSHConnectionService] SSH2 connect config:", {
        host: connectConfig.host,
        port: connectConfig.port,
        username: connectConfig.username,
        tryKeyboard: connectConfig.tryKeyboard,
        readyTimeout: connectConfig.readyTimeout,
      });

      console.log("[SSHConnectionService] Calling client.connect()...");
      this.client.connect(connectConfig);
      console.log("[SSHConnectionService] client.connect() called, waiting for response...");
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
