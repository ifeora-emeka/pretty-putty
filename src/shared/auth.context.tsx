"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { StoredConnection } from "@/src/main/types.storage";
import { AuthElectronService } from "./services/auth-electron.service";
import "@/src/main/types.preload";

interface AuthContextType {
  connections: StoredConnection[];
  selectedConnection: StoredConnection | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  selectConnection: (connection: StoredConnection) => void;
  saveConnection: (connection: StoredConnection, credentials: { password: string; rememberFor24h: boolean }) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
  logout: () => void;
  connect: (connection: StoredConnection, password: string, rememberFor24h: boolean) => Promise<void>;
  getStoredPassword: (connectionId: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connections, setConnections] = useState<StoredConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<StoredConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadConnections = useCallback(async () => {
    if (typeof window !== 'undefined' && window.storage) {
      try {
        const allConnections = await AuthElectronService.loadAllConnections();
        setConnections(allConnections);
      } catch (error) {
        console.error('Failed to load connections:', error);
        setConnections([]);
      }
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const selectConnection = useCallback((connection: StoredConnection) => {
    setSelectedConnection(connection);
  }, []);

  const saveConnection = useCallback(
    async (
      connection: StoredConnection,
      creds: { password: string; rememberFor24h: boolean }
    ) => {
      if (typeof window !== 'undefined' && window.storage) {
        await AuthElectronService.saveConnectionToStorage(
          connection,
          creds.password,
          creds.rememberFor24h
        );

        const allConnections = await AuthElectronService.loadAllConnections();
        setConnections(allConnections);
      }
    },
    []
  );

  const deleteConnection = useCallback(async (connectionId: string) => {
    if (typeof window !== 'undefined' && window.storage) {
      await AuthElectronService.deleteConnection(connectionId);
      
      const allConnections = await AuthElectronService.loadAllConnections();
      setConnections(allConnections);
    }
  }, []);

  const getStoredPassword = useCallback(
    async (connectionId: string): Promise<string | null> => {
      if (typeof window !== 'undefined' && window.storage) {
        return await AuthElectronService.loadStoredPassword(connectionId);
      }
      return null;
    },
    []
  );

  const connect = useCallback(async (connection: StoredConnection, password: string, rememberFor24h: boolean) => {
    setIsLoading(true);
    try {
      await AuthElectronService.saveConnectionToStorage(connection, password, rememberFor24h);
      
      const sessionResult = await AuthElectronService.createSession(
        connection.id,
        connection.host,
        connection.port,
        connection.username
      );

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || "Failed to create SSH session");
      }

      await AuthElectronService.updateLastConnected(connection.id);
      
      setIsAuthenticated(true);
      setSelectedConnection(connection);
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setSelectedConnection(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        connections,
        selectedConnection,
        isLoading,
        isAuthenticated,
        selectConnection,
        saveConnection,
        deleteConnection,
        logout,
        connect,
        getStoredPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
