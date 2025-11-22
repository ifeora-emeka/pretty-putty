"use client";

import React, { useEffect } from "react";
import { StoredConnection } from "@/src/main/types.storage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";

const connectionFormSchema = z.object({
    connectionName: z.string().min(1, "Connection name is required").max(100, "Connection name is too long"),
    host: z.string().min(1, "Host is required").max(255, "Host is too long"),
    port: z.number().min(1, "Port must be greater than 0").max(65535, "Port must be less than 65536"),
    username: z.string().min(1, "Username is required").max(255, "Username is too long"),
    password: z.string().min(1, "Password is required"),
    rememberFor24h: z.boolean(),
});

type ConnectionFormData = z.infer<typeof connectionFormSchema>;

interface ConnectionFormComponentProps {
    connection?: StoredConnection | null;
    storedPassword?: string | null;
    isLoading?: boolean;
    onSubmit: (data: ConnectionFormData) => void;
    onBack: () => void;
}

export const ConnectionFormComponent: React.FC<ConnectionFormComponentProps> = ({
    connection,
    storedPassword,
    isLoading = false,
    onSubmit,
    onBack,
}) => {
    const isExistingConnection = !!connection;
    
    const form = useForm<ConnectionFormData>({
        resolver: zodResolver(connectionFormSchema),
        defaultValues: {
            connectionName: connection?.name || "",
            host: connection?.host || "",
            port: connection?.port || 22,
            username: connection?.username || "",
            password: "",
            rememberFor24h: false,
        },
    });

    useEffect(() => {
        if (connection) {
            form.reset({
                connectionName: connection.name,
                host: connection.host,
                port: connection.port,
                username: connection.username,
                password: storedPassword || "",
                rememberFor24h: !!storedPassword,
            });
        }
    }, [connection, storedPassword, form]);

    const handleSubmit = (data: ConnectionFormData) => {
        onSubmit(data);
    };

    return (
        <div className="space-y-5">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                type="button"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to connections</span>
            </button>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {!isExistingConnection && (
                        <>  
                            <FormField
                                control={form.control}
                                name="connectionName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Connection Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Production Server"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="host"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Host</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="port"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Port</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="22"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="admin"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    {isExistingConnection && (
                        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                            <h3 className="font-semibold">{connection.name}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Host</span>
                                    <span className="text-foreground font-medium">{connection.host}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Port</span>
                                    <span className="text-foreground font-medium">{connection.port}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Username</span>
                                    <span className="text-foreground font-medium">{connection.username}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rememberFor24h"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="cursor-pointer text-sm font-normal">
                                        Remember password for 24 hours
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? "Connecting..." : "Connect"}
                    </Button>
                </form>
            </Form>
        </div>
    );
};
