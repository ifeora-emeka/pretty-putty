"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/src/shared/auth.context";
import { mockConnections, mockStoredCredentials } from "@/__mock__/auth.mock";
import { ConnectionListComponent } from "./connection-list.component";
import { ConnectionFormComponent } from "./connection-form.component";

type ViewType = "list" | "form-new" | "form-existing";

export const LoginComponent: React.FC = () => {
    const {
        connections,
        selectedConnection,
        isLoading,
        selectConnection,
        saveConnection,
        deleteConnection,
        connect,
        getStoredPassword,
        clearStoredPassword,
    } = useAuth();

    const [view, setView] = useState<ViewType>("list");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized && connections.length === 0) {
            mockConnections.forEach((conn) => {
                saveConnection(conn, { password: "", rememberFor24h: false });
            });
            setIsInitialized(true);
        }
    }, [connections.length, isInitialized, saveConnection]);

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

    const handleFormSubmit = async (credentials: {
        password: string;
        rememberFor24h: boolean;
    }) => {
        if (selectedConnection) {
            await connect(selectedConnection.id, credentials.password);
            saveConnection(selectedConnection, credentials);
        }
    };

    const storedPassword = selectedConnection
        ? getStoredPassword(selectedConnection.id)
        : null;

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
                            className="rounded-lg"
                            priority
                        />
                    </div>
                    <h1 className="text-3xl font-semibold text-foreground mb-2">Pretty Putty</h1>
                    <p className="text-sm text-muted-foreground">SSH Connection Manager</p>
                </div>
                
                <div className="bg-card rounded-lg border border-border shadow-sm">
                    <div className="p-6">
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
