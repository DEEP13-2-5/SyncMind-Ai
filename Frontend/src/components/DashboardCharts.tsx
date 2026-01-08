import {
    PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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
    { subject: 'Performance', A: 80, fullMark: 100 },
    { subject: 'Accessibility', A: 85, fullMark: 100 },
    { subject: 'Best Practices', A: 88, fullMark: 100 },
    { subject: 'SEO', A: 92, fullMark: 100 },
    { subject: 'Interactivity', A: 75, fullMark: 100 },
];

export function SystemHealthChart({ data, metrics, github }: { data?: any[], metrics?: any, github?: any }) {
    const rawData = data || healthData;
    const chartData = rawData.filter((d: any) => d.value > 0);
    const hasData = chartData.length > 0;

    // Calculate Launch Readiness Score (0-100)
    const calculateLaunchScore = () => {
        // Default to acceptable score if no data yet, but effectively 0 for calculating
        if (!metrics && !github) return 0;

        // ------------------------------------------
        // PART 1: Repository Signals (Max 50 points)
        // ------------------------------------------
        let githubScore = 0;
        if (github) {
            // Docker containerization (15 pts) - Essential for deployment
            if (github.docker?.present) githubScore += 15;

            // CI/CD Pipelines (15 pts) - Essential for automation
            if (github.cicd?.present) githubScore += 15;

            // Kubernetes (10 pts) - Orchestration
            if (github.kubernetes?.present) githubScore += 10;

            // Start Scripts (10 pts) - Runnability
            if (github.hasStartScript) githubScore += 10;
        }

        // ------------------------------------------
        // PART 2: Runtime Performance (Max 50 points)
        // ------------------------------------------
        let runtimeScore = 50; // Start perfect, deduct for issues

        if (metrics) {
            // Get error rates
            const failRate = metrics.failureRateUnderTest || 0;
            const p95 = metrics.latency?.p95 || 0;
            const p99 = metrics.latency?.p99 || 0;
            const p50 = metrics.latency?.p50 || 0;

            // Deduct for errors (Critical)
            if (failRate > 0.01) runtimeScore -= 25;       // >1% errors: Lose 25 pts (Half of runtime score)
            else if (failRate > 0.001) runtimeScore -= 15; // >0.1% errors: Lose 15 pts

            // Deduct for Latency (Experience)
            if (p95 > 1000) runtimeScore -= 10;     // >1s latency
            else if (p95 > 500) runtimeScore -= 5;  // >500ms latency

            // Deduct for Consistency
            if (p50 > 0 && p99 / p50 > 4) runtimeScore -= 5; // Inconsistent tails

            // Deduct for Throughput (don't penalize too hard if app is just small)
            if (metrics.throughput < 10) runtimeScore -= 5;

            // Cap at 0 (can't have negative runtime score)
            runtimeScore = Math.max(0, runtimeScore);
        } else {
            // If we have github data but no metrics yet (e.g. before first test), 
            // we don't grant free points.
            runtimeScore = 0;
        }

        return Math.min(100, githubScore + runtimeScore);
    };

    const launchScore = calculateLaunchScore();
    const healthStatus = launchScore >= 90 ? "Production Ready" : (launchScore >= 70 ? "Needs Optimization" : "Critical Issues");
    const healthColor = launchScore >= 90 ? "text-green-500" : (launchScore >= 70 ? "text-yellow-500" : "text-red-500");

    // Generate risk indicators
    const getRiskIndicators = () => {
        if (!metrics) return [];
        const risks = [];

        const failRate = metrics.failureRateUnderTest || 0;
        const p95 = metrics.latency?.p95 || 0;
        const p99 = metrics.latency?.p99 || 0;
        const p50 = metrics.latency?.p50 || 0;

        if (failRate > 0.01) {
            risks.push({ level: "critical", text: `${(failRate * 100).toFixed(2)}% error rate - users will encounter failures` });
        } else if (failRate > 0.001) {
            risks.push({ level: "warning", text: `${(failRate * 100).toFixed(2)}% error rate - monitor closely` });
        }

        if (p95 > 1000) {
            risks.push({ level: "critical", text: "5% of users experience >1s latency - poor UX" });
        } else if (p95 > 500) {
            risks.push({ level: "warning", text: "5% of users experience >500ms latency" });
        }

        if (p50 > 0 && p99 / p50 > 4) {
            risks.push({ level: "warning", text: "Inconsistent performance - high latency variance" });
        }

        if (metrics.throughput < 50) {
            risks.push({ level: "warning", text: "Low throughput - may struggle with traffic spikes" });
        }

        if (github && !github.docker?.present) {
            risks.push({ level: "info", text: "No Docker detected - deployment complexity" });
        }

        if (github && !github.cicd?.present) {
            risks.push({ level: "info", text: "No CI/CD detected - manual deployment risks" });
        }

        if (risks.length === 0) {
            risks.push({ level: "success", text: "No critical issues detected - ready for launch" });
        }

        return risks;
    };

    const riskIndicators = getRiskIndicators();

    return (
        <Card className="flex flex-col h-full shadow-lg border-border/50 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Launch Readiness Score</CardTitle>
                <CardDescription>Composite health assessment for production deployment</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center relative pt-4">
                <div className="h-[250px] w-full relative">
                    {hasData || metrics ? (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { value: launchScore, color: launchScore >= 90 ? "#22c55e" : (launchScore >= 70 ? "#eab308" : "#ef4444") },
                                            { value: 100 - launchScore, color: "#e5e7eb" }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {[0, 1].map((index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? (launchScore >= 90 ? "#22c55e" : (launchScore >= 70 ? "#eab308" : "#ef4444")) : "#e5e7eb"} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold tracking-tight">{launchScore.toFixed(0)}/100</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${healthColor}`}>
                                    {healthStatus}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            Waiting for telemetry...
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full mt-6 px-4">
                    {riskIndicators.slice(0, 3).map((risk, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${risk.level === 'critical' ? 'bg-red-500' :
                                risk.level === 'warning' ? 'bg-yellow-500' :
                                    risk.level === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                }`} />
                            <span className="text-muted-foreground font-medium leading-tight">{risk.text}</span>
                        </div>
                    ))}
                </div>

                <p className="text-[10px] text-muted-foreground mt-6 text-center italic opacity-70">
                    * Score based on errors, latency, throughput, and DevOps maturity
                </p>
            </CardContent>
        </Card>
    );
}

export function ThroughputChart({ data }: { data?: any[] }) {
    const chartData = data || throughputData;
    const isEmpty =
        !data ||
        data.length === 0 ||
        data.every(d =>
            (d.value ?? d.throughput ?? d.success ?? 0) === 0 &&
            (d.errors ?? d.errorRate ?? 0) === 0
        );

    return (
        <Card className="shadow-lg border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Throughput Reliability</CardTitle>
                <CardDescription>Success vs. Failure volume over time</CardDescription>
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
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="timestamp" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Reqs/s', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#888888' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', background: 'hsl(var(--background))' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area
                                    type="monotone"
                                    dataKey="success"
                                    stackId="1"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSuccess)"
                                    name="Successful Reqs/s"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="errors"
                                    stackId="1"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorError)"
                                    name="Failed Reqs/s"
                                />
                            </AreaChart>
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

    // Check if data is "empty" (all zeros or no data)
    const isEmpty = !data || data.length === 0 || data.every(d => d.A === 0);

    return (
        <Card className="shadow-lg border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Browser Experience Audit</CardTitle>
                <CardDescription>Performance, Accessibility, and Best Practices (Playwright Analysis)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full relative">
                    {isEmpty ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-muted/30 rounded-full p-4 mb-3">
                                <Activity className="text-muted-foreground w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground">No Audit Data</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                Run a test with a target URL to trigger the automated browser health audit.
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                <PolarGrid stroke="hsl(var(--border))" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.6}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', background: 'hsl(var(--background))' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function SummaryMatrixTable({ metrics, github }: { metrics?: any, github?: any }) {
    // Helper to safely parse failure rate from metrics
    const getFailureRate = (m: any): number => {
        if (!m) return 0;

        if (typeof m.failureRateUnderTest === 'number') {
            return m.failureRateUnderTest;
        } else if (typeof m.errorRate === 'string') {
            const parsed = parseFloat(m.errorRate);
            return isNaN(parsed) ? 0 : parsed / 100;
        } else if (typeof m.errorRate === 'number') {
            return m.errorRate > 1 ? m.errorRate / 100 : m.errorRate;
        }
        return 0;
    };

    const failureRate = getFailureRate(metrics);

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
                ? `${(failureRate * 100).toFixed(2)}%`
                : "N/A",
            status: failureRate < 0.01 ? "Pass" : (failureRate < 0.05 ? "Warn" : "Fail"),
            color: failureRate < 0.01 ? "text-green-500" : (failureRate < 0.05 ? "text-yellow-500" : "text-red-500")
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
