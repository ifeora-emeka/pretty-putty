import React from "react";
import { ConnectionHeaderComponent } from "@/components/connection-header.component";

export default function ConnectionPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ConnectionHeaderComponent
        connectionName="Production Server"
        host="prod.example.com"
        username="admin"
      />
      <div className="flex-1 p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
          <p className="text-muted-foreground">
            Connection dashboard will be available soon
          </p>
        </div>
      </div>
    </div>
  );
}
