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
        <div className="relative min-h-screen w-full overflow-hidden">
            <Image
                src="/vercel.svg"
                alt="background"
                fill
                className="absolute inset-0 object-cover opacity-20"
                quality={75}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30" />

            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-bold text-white">Pretty Putty</h1>
                            <p className="text-white/70">SSH Connection Manager</p>
                        </div>

                        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
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
        </div>
    );
};
