import { safeStorage } from "electron";

export class SecureCredentialStore {
  private credentials: Map<string, { encryptedPassword: string; expiresAt: number; createdAt: number }> = new Map();

  storePassword(connectionId: string, password: string, expiresIn24h: boolean): void {
    try {
      const encryptedPassword = safeStorage.encryptString(password);
      const expiresAt = expiresIn24h ? Date.now() + 24 * 60 * 60 * 1000 : 0;

      this.credentials.set(connectionId, {
        encryptedPassword: encryptedPassword.toString("base64"),
        expiresAt,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error(`Failed to store password for connection ${connectionId}:`, error);
      throw new Error(`Failed to encrypt and store password: ${error}`);
    }
  }

  getPassword(connectionId: string): string | null {
    try {
      const stored = this.credentials.get(connectionId);
      if (!stored) return null;

      if (stored.expiresAt > 0 && Date.now() > stored.expiresAt) {
        this.credentials.delete(connectionId);
        return null;
      }

      const decrypted = safeStorage.decryptString(Buffer.from(stored.encryptedPassword, "base64"));
      return decrypted;
    } catch (error) {
      console.error(`Failed to retrieve password for connection ${connectionId}:`, error);
      return null;
    }
  }

  clearPassword(connectionId: string): void {
    this.credentials.delete(connectionId);
  }

  clearAllPasswords(): void {
    this.credentials.clear();
  }

  clearExpiredPasswords(): void {
    const now = Date.now();
    for (const [connectionId, cred] of this.credentials.entries()) {
      if (cred.expiresAt > 0 && now > cred.expiresAt) {
        this.credentials.delete(connectionId);
      }
    }
  }

  hasPassword(connectionId: string): boolean {
    const stored = this.credentials.get(connectionId);
    if (!stored) return false;

    if (stored.expiresAt > 0 && Date.now() > stored.expiresAt) {
      this.credentials.delete(connectionId);
      return false;
    }

    return true;
  }
}
