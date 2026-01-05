import {
    PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";

// --- MOCK DATA ---

const healthData = [
    { name: 'Successful Responses (2xx)', value: 94, color: '#2563eb' }, // Blue
    { name: 'Failed Requests (Blocked / Rejected / 5xx)', value: 4, color: '#f59e0b' }, // Amber
    { name: 'Server Errors (5xx)', value: 2, color: '#ef4444' }, // Red
];

const throughputData = [
    { timestamp: '10:00', value: 1200, errors: 20 },
    { timestamp: '10:05', value: 2100, errors: 45 },
    { timestamp: '10:10', value: 3500, errors: 120 },
    { timestamp: '10:15', value: 2800, errors: 30 },
    { timestamp: '10:20', value: 4200, errors: 80 },
    { timestamp: '10:25', value: 5100, errors: 200 },
];

const scalabilityData = [
    { percentile: 'p50', latency: 45 },
    { percentile: 'p95', latency: 62 },
    { percentile: 'p99', latency: 85 },
    { percentile: 'avg', latency: 50 },
];

const securityData = [
    { subject: 'Auth Security', A: 90, fullMark: 150 },
    { subject: 'Rate Limiting', A: 75, fullMark: 150 },
    { subject: 'API Resilience', A: 85, fullMark: 150 },
    { subject: 'Data Integrity', A: 95, fullMark: 150 },
    { subject: 'Input Validation', A: 70, fullMark: 150 },
];

export function SystemHealthChart({ data }: { data?: any[] }) {
    const chartData = data || healthData;
    return (
        <Card className="flex flex-col h-full shadow-lg border-border/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Traffic Outcome Under Test Load</CardTitle>
                <CardDescription>Distribution of request outcomes during synthetic load</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs max-w-full px-2">
                    {chartData.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-1.5">
                            <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground whitespace-nowrap sm:whitespace-normal">
                                {entry.name}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center max-w-[90%] border-t pt-3 w-full">
                    Failures include rejections, blocks, and server errors observed under test traffic.
                </p>
            </CardContent>
        </Card>
    );
}

export function ThroughputChart({ data }: { data?: any[] }) {
    const chartData = data || throughputData;
    const isEmpty = !data || data.length === 0 || data.every(d => d.value === 0 && d.errors === 0);

    return (
        <Card className="shadow-lg border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Throughput vs Error Rate</CardTitle>
                <CardDescription>Correlation between load and failure spikes</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full relative">
                    {isEmpty ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-muted/30 rounded-full p-4 mb-3">
                                <Activity className="text-muted-foreground w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-semibold">No Performance Data</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                Test failed to record any requests. Check target URL connectivity.
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="timestamp" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Reqs/s" />
                                <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={false} name="Errors" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function ScalabilityChart({ data }: { data?: any[] }) {
    const chartData = data || scalabilityData;
    const isEmpty = !data || data.length === 0;

    return (
        <Card className="shadow-lg border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Scalability Benchmark</CardTitle>
                <CardDescription>Latencies at increasing concurrent user counts</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full relative">
                    {isEmpty ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-muted/30 rounded-full p-4 mb-3">
                                <Activity className="text-muted-foreground w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-semibold">No Latency Data</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                No requests were successful, so no latency percentiles could be calculated.
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="percentile" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}ms`} domain={[0, 'auto']} />
                                <Tooltip />
                                <Bar dataKey="latency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function SecurityRadarChart({ data, runtimeMetrics }: { data?: any[], runtimeMetrics?: any }) {
    const chartData = data || securityData;

    // Check if data is "empty" (all zeros)
    const isEmpty = !data || data.length === 0 || data.every(d => d.A === 0);

    // Calculate Overall Status based on GATING logic
    // 1. If Runtime Failed (high error rate) -> FAIL
    // 2. If Runtime Passed but Repo Signals mixed -> WARN
    // 3. If Runtime Passed and Repo Signals OK -> PASS

    // Check runtime failure (failureRate > 5% or serverErrors > 1%)
    const runtimeFailed = runtimeMetrics && (
        (runtimeMetrics.failureRateUnderTest > 0.05) ||
        (runtimeMetrics.serverErrorRate > 0.01)
    );

    // Check repo completeness (are critical signals present?)
    // We filter out 'Overall' from the check to avoid double counting
    const repoSignalsMissing = chartData.some(d => d.subject !== 'Overall' && d.A < 50);

    let overallStatus = "Pass";
    let overallColor = "text-green-500";
    let overallLabel = "Production Ready";

    if (runtimeFailed) {
        overallStatus = "Fail";
        overallColor = "text-red-500";
        overallLabel = "Runtime Failure";
    } else if (repoSignalsMissing) {
        overallStatus = "Warn";
        overallColor = "text-yellow-500";
        overallLabel = "Improvements Needed";
    }

    return (
        <Card className="shadow-lg border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Repository Signals (Static Analysis)</CardTitle>
                <CardDescription>Presence of DevOps best practices in repository</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full relative">
                    {isEmpty ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-muted/30 rounded-full p-4 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground w-8 h-8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">No Repository Detected</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                Add a GitHub URL to scan for Docker, CI/CD, and K8s configurations.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            {chartData.map((item, idx) => {
                                // Skip "Overall" in the list if we handled it separately, 
                                // OR render it with the new logic. Let's render it last.
                                if (item.subject === "Overall") {
                                    return (
                                        <div key={idx} className="space-y-1 pt-2 border-t border-border/50">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold">Overall Status</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold ${overallColor}`}>
                                                        {overallStatus === "Pass" ? '✓ Ready' : (overallStatus === "Warn" ? '⚠️ ' + overallLabel : '✗ ' + overallLabel)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                const percentage = item.A;
                                const isDetected = percentage > 0; // Simple existence check
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{item.subject}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold ${isDetected ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {isDetected ? '✓ Detected' : '⚠️ Not detected'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${isDetected ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                style={{ width: `${isDetected ? 100 : 5}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function SummaryMatrixTable({ metrics, github }: { metrics?: any, github?: any }) {
    const rows = [
        {
            category: "Performance",
            metric: "Throughput",
            value: metrics ? `${metrics.throughput.toFixed(2)} req/s` : "N/A",
            status: metrics && metrics.throughput > 0 ? "Pass" : "Fail",
            color: "text-green-500"
        },
        {
            category: "Performance",
            metric: "Failure Rate",
            value: metrics && metrics.totalRequests > 0
                ? `${((metrics.failureRateUnderTest ?? metrics.errorRate ?? 0) * 100).toFixed(2)}%`
                : "N/A",
            status: (metrics?.failureRateUnderTest ?? metrics?.errorRate ?? 0) < 0.01 ? "Pass" : ((metrics?.failureRateUnderTest ?? metrics?.errorRate ?? 0) < 0.05 ? "Warn" : "Fail"),
            color: (metrics?.failureRateUnderTest ?? metrics?.errorRate ?? 0) < 0.01 ? "text-green-500" : ((metrics?.failureRateUnderTest ?? metrics?.errorRate ?? 0) < 0.05 ? "text-yellow-500" : "text-red-500")
        },
        {
            category: "Performance",
            metric: "Latency (p95)",
            value: metrics ? `${metrics.latency.p95}ms` : "N/A",
            status: metrics && metrics.latency.p95 < 500 ? "Pass" : "Warn",
            color: "text-green-500"
        },
        {
            category: "Architecture",
            metric: "Docker Container",
            value: github?.docker?.present ? "Present" : "Not detected in repository",
            status: github?.docker?.present ? "Pass" : "Warn",
            color: github?.docker?.present ? "text-green-500" : "text-yellow-500"
        },
        {
            category: "Architecture",
            metric: "CI/CD Pipeline",
            value: github?.cicd?.present ? "Present" : "Not detected in repository",
            status: github?.cicd?.present ? "Pass" : "Warn",
            color: github?.cicd?.present ? "text-green-500" : "text-yellow-500"
        }
    ];

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-lg border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">System Health Matrix</CardTitle>
                <CardDescription>Consolidated performance and architectural compliance report</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Metric</th>
                                <th className="px-6 py-3">Value</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{row.category}</td>
                                    <td className="px-6 py-4">{row.metric}</td>
                                    <td className="px-6 py-4 font-mono">{row.value}</td>
                                    <td className={`px-6 py-4 font-bold ${row.color}`}>
                                        {row.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
