"use client";

import React, { useState, useEffect } from "react";
import { Connection } from "@/__mock__/auth.mock";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft } from "lucide-react";

interface ConnectionFormComponentProps {
    connection?: Connection | null;
    storedPassword?: string | null;
    isLoading?: boolean;
    onSubmit: (credentials: {
        password: string;
        rememberFor24h: boolean;
    }) => void;
    onBack: () => void;
}

export const ConnectionFormComponent: React.FC<ConnectionFormComponentProps> = ({
    connection,
    storedPassword,
    isLoading = false,
    onSubmit,
    onBack,
}) => {
    const [password, setPassword] = useState("");
    const [rememberFor24h, setRememberFor24h] = useState(false);
    const [host, setHost] = useState("");
    const [port, setPort] = useState("22");
    const [username, setUsername] = useState("");
    const [connectionName, setConnectionName] = useState("");

    useEffect(() => {
        if (connection) {
            setHost(connection.host);
            setPort(connection.port.toString());
            setUsername(connection.username);
            setConnectionName(connection.name);
            if (storedPassword) {
                setPassword(storedPassword);
                setRememberFor24h(true);
            }
        }
    }, [connection, storedPassword]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            password,
            rememberFor24h,
        });
    };

    const isExistingConnection = !!connection;

    return (
        <div className="space-y-5">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to connections</span>
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isExistingConnection && (
                    <>  
                        <div className="space-y-2">
                            <Label htmlFor="connection-name" className="text-sm font-medium">
                                Connection Name
                            </Label>
                            <Input
                                id="connection-name"
                                type="text"
                                placeholder="e.g., Production Server"
                                value={connectionName}
                                onChange={(e) => setConnectionName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="host" className="text-sm font-medium">
                                    Host
                                </Label>
                                <Input
                                    id="host"
                                    type="text"
                                    placeholder="example.com"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="port" className="text-sm font-medium">
                                    Port
                                </Label>
                                <Input
                                    id="port"
                                    type="number"
                                    placeholder="22"
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                {isExistingConnection && (
                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                        <h3 className="font-semibold">{connectionName}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Host</span>
                                <span className="text-foreground font-medium">{host}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Port</span>
                                <span className="text-foreground font-medium">{port}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                                <span>Username</span>
                                <span className="text-foreground font-medium">{username}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="remember-24h"
                        checked={rememberFor24h}
                        onCheckedChange={(checked) => setRememberFor24h(checked as boolean)}
                    />
                    <Label
                        htmlFor="remember-24h"
                        className="cursor-pointer text-sm font-normal"
                    >
                        Remember password for 24 hours
                    </Label>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? "Connecting..." : "Connect"}
                </Button>
            </form>
        </div>
    );
};
