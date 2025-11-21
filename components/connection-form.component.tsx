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
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <form onSubmit={handleSubmit} className="space-y-5">
                {!isExistingConnection && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="connection-name" className="text-white">
                                Connection Name
                            </Label>
                            <Input
                                id="connection-name"
                                type="text"
                                placeholder="e.g., Production Server"
                                value={connectionName}
                                onChange={(e) => setConnectionName(e.target.value)}
                                className="bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="host" className="text-white">
                                    Host
                                </Label>
                                <Input
                                    id="host"
                                    type="text"
                                    placeholder="example.com"
                                    value={host}
                                    onChange={(e) => setHost(e.target.value)}
                                    className="bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="port" className="text-white">
                                    Port
                                </Label>
                                <Input
                                    id="port"
                                    type="number"
                                    placeholder="22"
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                    className="bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-white">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                                required
                            />
                        </div>
                    </>
                )}

                {isExistingConnection && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-white font-medium">{connectionName}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-white/70">
                                <span>Host:</span>
                                <span className="text-white">{host}</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                                <span>Port:</span>
                                <span className="text-white">{port}</span>
                            </div>
                            <div className="flex justify-between text-white/70">
                                <span>Username:</span>
                                <span className="text-white">{username}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                        Password
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                        required
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="remember-24h"
                        checked={rememberFor24h}
                        onCheckedChange={(checked) => setRememberFor24h(checked as boolean)}
                        className="border-white/30 bg-white/10"
                    />
                    <Label
                        htmlFor="remember-24h"
                        className="text-white/80 cursor-pointer font-normal"
                    >
                        Remember password for 24 hours
                    </Label>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
                >
                    {isLoading ? "Connecting..." : "Connect"}
                </Button>
            </form>
        </div>
    );
};
