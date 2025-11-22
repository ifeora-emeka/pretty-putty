"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/shared/auth.context";
import { useConnection } from "@/src/shared/connection.context";
import { ConnectionListComponent } from "./connection-list.component";
import { ConnectionFormComponent } from "./connection-form.component";

type ViewType = "list" | "form-new" | "form-existing";

export const LoginComponent: React.FC = () => {
    const router = useRouter();
    const {
        connections,
        selectedConnection,
        isLoading,
        selectConnection,
        saveConnection,
        deleteConnection,
        connect,
        getStoredPassword,
    } = useAuth();
    
    const { setConnectionId, setMetadata } = useConnection();

    const [view, setView] = useState<ViewType>("list");
    const [error, setError] = useState<string | null>(null);

    const handleSelectConnection = (connection: any) => {
        selectConnection(connection);
        setView("form-existing");
    };

    const handleAddNew = () => {
        setView("form-new");
    };

    const handleBackToList = () => {
        setView("list");
    };

    const handleFormSubmit = async (formData: {
        connectionName: string;
        host: string;
        port: number;
        username: string;
        password: string;
        rememberFor24h: boolean;
    }) => {
        setError(null);
        try {
            let connectionToUse = selectedConnection;
            
            if (!connectionToUse) {
                connectionToUse = {
                    id: `conn_${Date.now()}`,
                    name: formData.connectionName,
                    host: formData.host,
                    port: formData.port,
                    username: formData.username,
                    lastConnected: new Date().toISOString(),
                };
                
                await saveConnection(connectionToUse, {
                    password: formData.password,
                    rememberFor24h: formData.rememberFor24h
                });
            }
            
            await connect(connectionToUse, formData.password, formData.rememberFor24h);
            
            setConnectionId(connectionToUse.id);
            setMetadata({
                host: connectionToUse.host,
                port: connectionToUse.port,
                username: connectionToUse.username,
                connectionName: connectionToUse.name,
                connectedAt: Date.now(),
            });
            
            router.push('/connection');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Connection failed");
        }
    };

    const [storedPassword, setStoredPassword] = useState<string | null>(null);
    
    useEffect(() => {
        const loadPassword = async () => {
            if (selectedConnection) {
                const password = await getStoredPassword(selectedConnection.id);
                setStoredPassword(password);
            } else {
                setStoredPassword(null);
            }
        };
        loadPassword();
    }, [selectedConnection, getStoredPassword]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Image
                            src="/logo.jpg"
                            alt="Pretty Putty Logo"
                            width={64}
                            height={64}
                            className="rounded-xl"
                            priority
                        />
                    </div>
                    <h1 className="text-3xl font-semibold text-foreground mb-2">Pretty Putty</h1>
                    <p className="text-sm text-muted-foreground">SSH Connection Manager</p>
                </div>
                
                <div className="bg-card rounded-lg border border-border shadow-sm">
                    <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}
                            
                            {view === "list" && (
                                <ConnectionListComponent
                                    connections={connections}
                                    onSelectConnection={handleSelectConnection}
                                    onAddNew={handleAddNew}
                                    onDelete={deleteConnection}
                                />
                            )}

                            {view === "form-existing" && selectedConnection && (
                                <ConnectionFormComponent
                                    connection={selectedConnection}
                                    storedPassword={storedPassword}
                                    isLoading={isLoading}
                                    onSubmit={handleFormSubmit}
                                    onBack={handleBackToList}
                                />
                            )}

                            {view === "form-new" && (
                                <ConnectionFormComponent
                                    isLoading={isLoading}
                                    onSubmit={handleFormSubmit}
                                    onBack={handleBackToList}
                                />
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};
