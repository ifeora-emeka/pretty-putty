"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/shared/auth.context";
import { mockConnections } from "@/__mock__/auth.mock";

export const ConnectionSeeder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { connections, saveConnection } = useAuth();
    const [isSeeded, setIsSeeded] = useState(false);

    useEffect(() => {
        const seedConnections = async () => {
            if (!isSeeded && connections.length === 0 && typeof window !== 'undefined' && window.storage) {
                for (const conn of mockConnections) {
                    await saveConnection(conn, { password: "", rememberFor24h: false });
                }
                setIsSeeded(true);
            }
        };
        
        seedConnections();
    }, [connections.length, isSeeded, saveConnection]);

    return <>{children}</>;
};
