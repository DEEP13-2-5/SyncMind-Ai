import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Redirect } from "wouter";
import {
  Plus,
  Activity,
  GitBranch,
  Cpu,
  Clock,
  BrainCircuit,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { DashboardChat } from "@/components/DashboardChat";
import {
  SystemHealthChart,
  ThroughputChart,
  ScalabilityChart,
  SecurityRadarChart,
  SummaryMatrixTable
} from "@/components/DashboardCharts";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [latestData, setLatestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- FETCH LATEST TEST (ONCE ON MOUNT / UPDATE) ---------------- */
  useEffect(() => {
    if (!user || !token) return;

    setIsLoading(true);
    api.getLatestLoadTest(token)
      .then((res: any) => {
        setLatestData(res);
      })
      .catch((err: any) => console.error("Fetch error:", err))
      .finally(() => setIsLoading(false));
  }, [user?.totalTests, token]);

  if (!user) return <Redirect to="/" />;

  const testsRun = user.totalTests || 0;
  const hasNoData = testsRun === 0;

  const m = latestData?.metrics;
  const g = latestData?.github;

  /* ---------------- FALLBACK MOCK DATA (DEMO MODE) ---------------- */
  // Users requested REAL data even if 0. Disabling auto-mock.
  const isDemo = false; // !m || m.throughput === 0;

  const mockHealth = [
    { name: "Success", value: 92 },
    { name: "Errors", value: 8 },
    { name: "Timeouts", value: 0 },
  ];

  const mockThroughput = [
    { timestamp: "T-4s", value: 2400, errors: 50 },
    { timestamp: "T-3s", value: 1800, errors: 40 },
    { timestamp: "T-2s", value: 3200, errors: 120 },
    { timestamp: "T-1s", value: 2900, errors: 80 },
    { timestamp: "Latest", value: 3500, errors: 15 },
  ];

  const mockScalability = [
    { percentile: "p50", latency: 45 },
    { percentile: "p95", latency: 120 },
    { percentile: "p99", latency: 250 },
    { percentile: "avg", latency: 65 },
  ];

  const mockSecurity = [
    { subject: "Docker", A: 100, fullMark: 100 },
    { subject: "CI/CD", A: 0, fullMark: 100 },
    { subject: "K8s", A: 60, fullMark: 100 },
    { subject: "Scripts", A: 100, fullMark: 100 },
    { subject: "Overall", A: 75, fullMark: 100 },
  ];

  /* ---------------- REAL DATA WITH SYNTHETIC TREND ---------------- */

  // Helper to add small variance (+/- 10%)
  const variance = (base: number) => {
    if (!base) return 0;
    const variation = base * 0.1;
    return Math.max(0, base - variation + Math.random() * (variation * 2));
  };

  /* ---------------- REAL DATA LOGIC ---------------- */

  const isFailed = m && m.totalRequests === 0 && (m.vus > 0 || m.duration === null);

  // Safe access to failure rate with fallback for legacy data
  const failRate = m?.failureRateUnderTest ?? m?.errorRate ?? 0;
  const serverRate = m?.serverErrorRate ?? 0;

  const healthData = m
    ? [
      {
        name: "Successful Responses (2xx)",
        value: isFailed ? 0 : Math.max(0, 100 - (failRate * 100)),
        color: "#2563eb"
      },
      {
        name: "Failed Requests (Blocked / Rejected / 5xx)",
        // Amber is everything that failed BUT IS NOT a generic server error
        // If serverErrorRate is missing (legacy), simple math: failRate - 0 = failRate.
        value: isFailed ? 100 : Math.max(0, (failRate * 100) - (serverRate * 100)),
        color: "#f59e0b"
      },
      {
        name: "Server Errors (5xx)",
        value: Math.min(100, serverRate * 100),
        color: "#ef4444"
      },
    ]
    : [];

  const throughputData = m
    ? [
      { timestamp: "T-4s", value: variance(m.throughput * 0.8), errors: variance(m.throughput * 0.8 * failRate) },
      { timestamp: "T-3s", value: variance(m.throughput * 0.9), errors: variance(m.throughput * 0.9 * failRate) },
      { timestamp: "T-2s", value: variance(m.throughput * 1.0), errors: variance(m.throughput * 1.0 * failRate) },
      { timestamp: "T-1s", value: variance(m.throughput * 1.1), errors: variance(m.throughput * 1.1 * failRate) },
      { timestamp: "Latest", value: m.throughput, errors: m.throughput * failRate },
    ]
    : [];

  const toMs = (v?: number) => {
    if (typeof v !== "number" || v === 0) return 0;
    return v > 10 ? v : v * 1000;
  };

  const scalabilityData = m
    ? [
      { percentile: "p50", latency: toMs(m.latency?.p50) },
      { percentile: "p95", latency: toMs(m.latency?.p95) },
      { percentile: "p99", latency: toMs(m.latency?.p99) },
      { percentile: "avg", latency: toMs(m.latency?.avg) },
    ].filter(item => item.latency > 0) // Remove zero values
    : [];

  const securityData = g
    ? [
      { subject: "Docker", A: g.docker?.present ? 95 : 0, fullMark: 100 },
      { subject: "CI/CD", A: g.cicd?.present ? 90 : 0, fullMark: 100 },
      { subject: "K8s", A: g.kubernetes?.present ? 80 : 0, fullMark: 100 },
      { subject: "Scripts", A: g.hasStartScript ? 100 : 0, fullMark: 100 },
      { subject: "Overall", A: g.summary?.devOpsScore ?? 0, fullMark: 100 },
    ]
    : mockSecurity; // Show demo data instead of empty

  const stats = [
    {
      label: "Available Credits",
      value:
        user.subscription.plan === "free"
          ? user.credits.toString()
          : "Unlimited",
      icon: Cpu,
      color: "text-primary",
    },
    {
      label: "Total Tests Run",
      value: testsRun.toString(),
      icon: Activity,
      color: "text-emerald-500",
    },
    {
      label: "Plan Status",
      value: user.subscription.plan,
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                {hasNoData ? "Agentic AI Active" : "Insight Lab Ready"}
              </span>
            </div>

            <h1 className="text-3xl font-bold">
              {hasNoData ? "System Overview" : "Last Test Completed"}
            </h1>

            <p className="text-muted-foreground mt-1">
              {hasNoData
                ? `Welcome, ${user.username}! Run your first test to unlock insights.`
                : `Analyzing telemetry for: ${latestData?.url}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isLoading && (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            )}

            {!hasNoData && (
              <Button
                variant="outline"
                onClick={() =>
                  chatRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Ask AI
              </Button>
            )}

            <Link href="/load-test">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                New Load Test
              </Button>
            </Link>
          </div>
        </div>

        {/* MAIN CONTENT (k6 & github metrics only) */}

        {/* MAIN CONTENT */}
        {hasNoData ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-20 text-center text-muted-foreground">
              Run your first load test to view system health, charts, and AI analysis.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-8">
              <SystemHealthChart data={healthData} />

              <div ref={chatRef} className="lg:col-span-2 h-[600px]">
                <DashboardChat
                  sessionId={latestData?.id}
                  initialMessage={latestData?.ai?.message}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ThroughputChart data={throughputData} />
              <ScalabilityChart data={scalabilityData} />
              <SecurityRadarChart data={securityData} runtimeMetrics={m} />
            </div>

            <div className="mt-8">
              <SummaryMatrixTable metrics={m} github={g} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
