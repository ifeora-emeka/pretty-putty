"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Connection, StoredCredentials } from "@/__mock__/auth.mock";

interface AuthContextType {
  connections: Connection[];
  selectedConnection: Connection | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  credentials: Record<string, { password: string; rememberFor24h: boolean }>;
  selectConnection: (connection: Connection) => void;
  saveConnection: (connection: Connection, credentials: { password: string; rememberFor24h: boolean }) => void;
  deleteConnection: (connectionId: string) => void;
  logout: () => void;
  connect: (connectionId: string, password: string) => Promise<void>;
  getStoredPassword: (connectionId: string) => string | null;
  clearStoredPassword: (connectionId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState<
    Record<string, { password: string; rememberFor24h: boolean }>
  >({});

  const selectConnection = useCallback((connection: Connection) => {
    setSelectedConnection(connection);
  }, []);

  const saveConnection = useCallback(
    (
      connection: Connection,
      creds: { password: string; rememberFor24h: boolean }
    ) => {
      setConnections((prev) => {
        const exists = prev.some((c) => c.id === connection.id);
        if (exists) {
          return prev.map((c) =>
            c.id === connection.id
              ? { ...connection, hasStoredPassword: creds.rememberFor24h }
              : c
          );
        }
        return [
          ...prev,
          { ...connection, hasStoredPassword: creds.rememberFor24h },
        ];
      });

      if (creds.rememberFor24h) {
        setCredentials((prev) => ({
          ...prev,
          [connection.id]: creds,
        }));
      }
    },
    []
  );

  const deleteConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    setCredentials((prev) => {
      const newCreds = { ...prev };
      delete newCreds[connectionId];
      return newCreds;
    });
  }, []);

  const getStoredPassword = useCallback(
    (connectionId: string): string | null => {
      const cred = credentials[connectionId];
      return cred?.password || null;
    },
    [credentials]
  );

  const clearStoredPassword = useCallback((connectionId: string) => {
    setCredentials((prev) => {
      const newCreds = { ...prev };
      delete newCreds[connectionId];
      return newCreds;
    });
  }, []);

  const connect = useCallback(async (connectionId: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
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
        credentials,
        selectConnection,
        saveConnection,
        deleteConnection,
        logout,
        connect,
        getStoredPassword,
        clearStoredPassword,
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
