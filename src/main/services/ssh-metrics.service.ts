import { Client, ClientChannel } from "ssh2";

export interface RemoteSystemMetrics {
    cpu: number;
    memory: number;
    memoryUsed: number;
    memoryTotal: number;
    disk: number;
    diskUsed: number;
    diskTotal: number;
    loadAverage: number[];
    timestamp: number;
    osName?: string;
    uptime?: string;
    cpuModel?: string;
    cpuCores?: number;
    hostname?: string;
    kernel?: string;
}

export class SSHMetricsService {
    private static instance: SSHMetricsService;

    private constructor() { }

    static getInstance(): SSHMetricsService {
        if (!SSHMetricsService.instance) {
            SSHMetricsService.instance = new SSHMetricsService();
        }
        return SSHMetricsService.instance;
    }

    private execCommand(client: Client, cmd: string): Promise<string> {
        return new Promise((resolve, reject) => {
            client.exec(cmd, (err, stream: ClientChannel) => {
                if (err) return reject(err);
                let output = "";
                stream.on("data", (chunk: Buffer) => (output += chunk.toString()));
                stream.on("error", reject);
                stream.on("close", () => {
                    resolve(output);
                });
            });
        });
    }

    async getRemoteMetrics(client: Client): Promise<RemoteSystemMetrics> {
        try {
            const [
                cpuOutput,
                memOutput,
                diskOutput,
                osOutput,
                uptimeOutput,
                cpuModelOutput,
                cpuCoresOutput,
                hostnameOutput,
                kernelOutput,
            ] = await Promise.all([
                this.execCommand(client, "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1 || echo '0'"),
                this.execCommand(client, "free -b | grep Mem | awk '{print $2, $3}'"),
                this.execCommand(client, "df -B1 / | tail -1 | awk '{print $2, $3}'"),
                this.execCommand(client, "cat /etc/os-release | grep PRETTY_NAME | cut -d'\"' -f2 || uname -s"),
                this.execCommand(client, "uptime -p || echo 'Unknown'"),
                this.execCommand(client, "cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d':' -f2 || echo 'Unknown'"),
                this.execCommand(client, "nproc || grep -c processor /proc/cpuinfo"),
                this.execCommand(client, "hostname"),
                this.execCommand(client, "uname -r"),
            ]);

            const cpuUsage = this.parseCPU(cpuOutput);
            const { memoryTotal, memoryUsed } = this.parseMemory(memOutput);
            const { diskTotal, diskUsed } = this.parseDisk(diskOutput);
            const loadAverage = await this.getLoadAverage(client);

            const memoryPercent = memoryTotal > 0 ? Math.round((memoryUsed / memoryTotal) * 100) : 0;
            const diskPercent = diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 100) : 0;

            return {
                cpu: cpuUsage,
                memory: memoryPercent,
                memoryUsed,
                memoryTotal,
                disk: diskPercent,
                diskUsed,
                diskTotal,
                loadAverage,
                timestamp: Date.now(),
                osName: osOutput.trim(),
                uptime: uptimeOutput.trim(),
                cpuModel: cpuModelOutput.trim(),
                cpuCores: parseInt(cpuCoresOutput.trim()) || 1,
                hostname: hostnameOutput.trim(),
                kernel: kernelOutput.trim(),
            };
        } catch (error) {
            throw new Error(`Failed to fetch remote metrics: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    private parseCPU(output: string): number {
        const value = parseFloat(output.trim());
        return Math.min(Math.max(isNaN(value) ? 0 : Math.round(value), 0), 100);
    }

    private parseMemory(output: string): { memoryTotal: number; memoryUsed: number } {
        const parts = output.trim().split(/\s+/);
        const total = parseInt(parts[0]) || 0;
        const used = parseInt(parts[1]) || 0;
        return {
            memoryTotal: Math.round(total / (1024 * 1024 * 1024)),
            memoryUsed: Math.round(used / (1024 * 1024 * 1024)),
        };
    }

    private parseDisk(output: string): { diskTotal: number; diskUsed: number } {
        const parts = output.trim().split(/\s+/);
        const total = parseInt(parts[0]) || 0;
        const used = parseInt(parts[1]) || 0;
        return {
            diskTotal: Math.round(total / (1024 * 1024 * 1024)),
            diskUsed: Math.round(used / (1024 * 1024 * 1024)),
        };
    }

    private async getLoadAverage(client: Client): Promise<number[]> {
        try {
            const output = await this.execCommand(client, "cat /proc/loadavg | awk '{print $1, $2, $3}'");
            const parts = output.trim().split(/\s+/);
            return [
                parseFloat(parts[0]) || 0,
                parseFloat(parts[1]) || 0,
                parseFloat(parts[2]) || 0,
            ];
        } catch {
            return [0, 0, 0];
        }
    }
}
