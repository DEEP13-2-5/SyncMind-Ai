import express from "express";
import mongoose from "mongoose";
import { runK6Test } from "../Runners/k6runner.js";
import { parseK6Data, buildChartResponse, buildPieChartData } from "../Utils/Loaddata.js";
import { analyzeGithubRepo } from "../Utils/githubAnalyzer.js";
import getresponseopenrouter from "../Utils/openrouter.js";
import { checkCreditsOrSub } from "../Middleware/authMiddleware.js";
import TestSession from "../Models/TestSession.js";
import fetch from "node-fetch"; // Ensure this is available or use native fetch


const router = express.Router();

// Run Load Test -> POST /api/load-test
router.post("/", checkCreditsOrSub, async (req, res) => {
  try {
    const { testURL, githubRepo } = req.body;
    console.log(`📥 [Request Body] URL: "${testURL}", Repo: "${githubRepo}"`);

    if (!testURL && !githubRepo) {
      return res.status(400).json({ error: "Provide testURL or githubRepo" });
    }

    let testResult = null;
    let githubResult = null;
    let k6Error = null;

    // --- OPTIONAL DEMO MODE GUARD ---
    const mode = process.env.EXECUTION_MODE;
    const nodeEnv = process.env.NODE_ENV;
    const isDemoMode = mode === "demo";

    console.log(`🔍 [Router] EXECUTION_MODE: "${mode}", NODE_ENV: "${nodeEnv}", isDemoMode: ${isDemoMode}`);

    if (isDemoMode) {
      console.log("🛠️ Router logic: Manual Demo Override is ON.");

      // --- SMART CONNECTIVITY CHECK ---
      let isUp = true;
      let mockFailRate = 0;

      try {
        if (testURL) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const check = await fetch(testURL, {
            method: 'HEAD',
            signal: controller.signal,
            headers: { 'User-Agent': 'SynthMind-Connectivity-Check/1.0' }
          }).catch(() => ({ ok: false }));
          clearTimeout(timeoutId);
          isUp = check.ok;
        }
      } catch (e) {
        isUp = false;
      }

      if (!isUp) {
        console.log("⚠️ Target URL appears down. Forcing 100% failure in simulation.");
        mockFailRate = 1.0;
      } else {
        mockFailRate = Math.random() > 0.85 ? 0.04 + Math.random() * 0.08 : 0;
      }

      // 1. Simulate K6 Metrics (Nested to match real k6 output)
      const mockLatency = isUp ? (120 + Math.random() * 200) : 5000;
      const mockTotalReqs = 450;

      testResult = {
        metrics: {
          http_req_duration: {
            values: {
              avg: mockLatency, med: mockLatency * 0.9, "p(95)": mockLatency * 1.4, "p(99)": mockLatency * 2, max: mockLatency * 3
            }
          },
          http_reqs: { values: { count: mockTotalReqs, rate: mockTotalReqs / 30 } },
          http_req_failed: {
            values: {
              rate: mockFailRate,
              passes: Math.floor(mockTotalReqs * (1 - mockFailRate)),
              fails: Math.floor(mockTotalReqs * mockFailRate)
            }
          },
          vus: { values: { value: 10, max: 10 } }
        },
        state: { testRunDurationMs: 30000 }
      };

      // 2. Simulate GitHub Signals (ONLY IF REPO PROVIDED)
      if (githubRepo) {
        const isNext = testURL?.includes("vercel") || testURL?.includes("next") || githubRepo.toLowerCase().includes("next");
        githubResult = {
          framework: isNext ? "Next.js" : "Express",
          hasStartScript: true,
          database: isNext ? "PostgreSQL (Prisma)" : "MongoDB",
          dependencyCount: isNext ? 42 : 24,
          docker: { present: true, hasCMD: true, exposesPort: true },
          kubernetes: { present: Math.random() > 0.5, type: "raw" },
          cicd: { present: true },
          issues: [],
          summary: { productionReady: true, devOpsScore: 85, riskLevel: "low" }
        };

        // Recalculate score for consistency
        githubResult.summary.devOpsScore =
          (githubResult.docker.present ? 30 : 0) +
          (githubResult.cicd.present ? 30 : 0) +
          (githubResult.kubernetes.present ? 20 : 0) +
          (githubResult.hasStartScript ? 20 : 0);
      } else {
        githubResult = null;
      }

      console.log("✅ Smart Simulation ready.");
    } else {
      // REAL MODE: Only runs if explicitly configured (e.g., Local Dev)
      console.log("⚡ ENV: Real Mode. Executing k6 and GitHub analysis...");
      console.log("🧪 RAW k6 OUTPUT:", realTest);
      console.log("📦 RAW GitHub OUTPUT:", realGithub);

      const [realTest, realGithub] = await Promise.all([
        testURL
          ? runK6Test(testURL, { vus: 100, duration: "5s" }).catch(e => {
            console.error("⚠️ K6 Test Failed:", e);
            k6Error = e.message;
            return null;
          })
          : Promise.resolve(null),
        githubRepo
          ? analyzeGithubRepo(githubRepo).catch(e => {
            console.error("⚠️ GitHub Analysis Failed:", e);
            return null;
          })
          : Promise.resolve(null)
      ]);
      testResult = realTest;
      githubResult = realGithub;
    }

    console.log("✅ Analysis phase finished.");

    let metrics = null;
    let charts = null;
    let healthData = null;
    let github = githubResult;

    if (testResult) {
      metrics = parseK6Data(testResult);
      charts = buildChartResponse(metrics);
      healthData = buildPieChartData(metrics);
      console.log("📊 Parsed Metrics:", metrics);
      console.log("📈 Charts Data:", charts);
      console.log("🥧 Health Pie Data:", healthData);

    }

    if (github && github.summary) {
      // Calculate score if present
      console.log("🐙 Normalized GitHub Signals:", github);
      github.summary.devOpsScore =
        (github.docker.present ? 30 : 0) +
        (github.cicd.present ? 30 : 0) +
        (github.kubernetes.present ? 20 : 0) +
        (github.hasStartScript ? 20 : 0);

      github.summary.productionReady =
        github.hasStartScript &&
        github.docker.present &&
        github.cicd.present;

      github.summary.riskLevel =
        github.summary.devOpsScore >= 70
          ? "low"
          : github.summary.devOpsScore >= 40
            ? "medium"
            : "high";
    }

    // -------------------------------------------------------------------------
    // SANITIZATION HELPERS
    // -------------------------------------------------------------------------
    const safePercent = (v) =>
      Number.isFinite(v) ? (v * 100).toFixed(2) : "0.00";

    const safeNumber = (v, fallback = "N/A") =>
      Number.isFinite(v) ? v : fallback;

    // -------------------------------------------------------------------------
    // BUILD AI CONTEXT (SANITIZED, DETERMINISTIC)
    // -------------------------------------------------------------------------
    let context = `Target under test: ${testURL || githubRepo}\n\n`;

    if (metrics) {
      context += `Runtime Metrics (Observed):\n`;
      context += `- Failure Rate: ${safePercent(metrics.failureRateUnderTest)}%\n`;
      context += `- p95 Latency: ${safeNumber(metrics.latency?.p95)} ms\n`;
      context += `- Avg Latency: ${safeNumber(metrics.latency?.avg)} ms\n`;
      context += `- Throughput: ${safeNumber(metrics.throughput)} req/s\n`;
      context += `- Server Error Rate (5xx): ${safePercent(metrics.serverErrorRate)}%\n\n`;
    }

    if (githubResult?.summary) {
      context += `Repository Signals (Static):\n`;
      context += `- Docker: ${githubResult.docker.present ? "Detected" : "Not detected"}\n`;
      context += `- CI/CD: ${githubResult.cicd.present ? "Detected" : "Not detected"}\n`;
      context += `- Kubernetes: ${githubResult.kubernetes.present ? "Detected" : "Not detected"}\n\n`;
    } else {
      context += `Repository Signals: Not available (no repository provided)\n\n`;
    }

    // -------------------------------------------------------------------------
    // SYNTHMIND AI — LIVE AUDIT AGENTIC MODE
    // -------------------------------------------------------------------------
    /**
    * Live Audit Agentic AI
    * Purpose:
    * - Interpret runtime telemetry
    * - Decide stability / instability
    * - NO fixes, NO scaling, NO advice
    * - Designed for pre-launch readiness & audit clarity
    */

    const runLiveAuditAI = async ({
      metrics,
      error,
      context,
      getresponseopenrouter
    }) => {
      let aiResponseMsg = "SynthMind AI Verdict: Analysis pending...";

      if (!metrics) {
        return {
          message:
            "SynthMind AI could not retrieve metrics for this test. Please ensure the target URL is valid and try again."
        };
      }

      try {
        const safeContext =
          typeof context === "string" && context.trim().length > 0
            ? context.slice(0, 6000)
            : "Runtime Metrics:\n" + JSON.stringify(metrics, null, 2);

        const messages = [
          {
            role: "system",
            content: `
You are SynthMind AI, a Mature Business Continuity Analyst. Your audience is Non-Technical Startup Founders.

Your purpose is to interpret telemetry to determine if a product is ready for users (Launch Readiness).

STRICT RULES:
1. NO technical jargon (e.g., "p95", "throughput", "5xx") in the main paragraphs. Use "User Experience Speed", "System Capacity", and "Error Rate".
2. NO fixes, scaling advice, or technical remediation.
3. NO mention of databases, infrastructure, or root causes.
4. If failures exist, explain the BUSINESS IMPACT (i.e., "Users will see errors").

If asked for technical help, respond:
"This interface provides business analysis only. Use Ask AI for technical remediation."
        `.trim()
          },
          {
            role: "user",
            content: `
${safeContext}

Generate the Live Audit strictly in this format:

**SynthMind AI Verdict**

Paragraph 1: Launch Suitability
State clearly whether the product is suitable for a public launch under this specific load. Describe the speed and success rate in terms of "User Experience".

Paragraph 2: Stability Reasoning
Explain what the data indicates about the product's stability. Use business impact reasoning (e.g., "The system is robust enough for your expected initial traffic").

Paragraph 3: Unknowns
Explain what this specific test cannot tell you (e.g., "This doesn't guarantee security or stability under 10x more load").

Confidence Scope:
Runtime telemetry — High
Repository signals — Medium
Production inference — Not evaluated
        `.trim()
          }
        ];

        const response = await getresponseopenrouter(messages);

        aiResponseMsg =
          typeof response === "string" && response.trim().length > 0
            ? response.trim()
            : "**SynthMind AI Verdict**\n\nAnalysis completed. Refer to displayed metrics.";

      } catch (err) {
        console.error("⚠️ Live Audit Agentic AI failed:", err);
        aiResponseMsg =
          "SynthMind AI could not generate the live audit due to a temporary service issue.";
      }

      return {
        message: aiResponseMsg
      };
    };

    // --- EXECUTE AI ANALYSIS ---
    const aiResponse = await runLiveAuditAI({
      metrics,
      error: k6Error,
      context,
      getresponseopenrouter
    });
    const aiResponseMsg = aiResponse.message;

    // Create new session in DB
    const session = new TestSession({
      user: req.user._id,
      url: testURL || githubRepo,
      metrics,
      charts,
      healthData,
      github,
      ai: {
        message: aiResponse.message,
        verdict: aiResponse.verdict,
        confidence: aiResponse.confidence
      },
      chatHistory: [{ role: "bot", content: aiResponseMsg }]
    });

    await session.save();
    const sessionId = session._id.toString();

    // Save as last session for this user
    try {
      req.user.lastSessionId = sessionId;
      await req.user.save();
      console.log(`💾 Last session ID (${sessionId}) saved for user: ${req.user.username}`);
    } catch (saveErr) {
      console.error("⚠️ Failed to save lastSessionId:", saveErr);
    }

    return res.json({
      success: true,
      id: sessionId,
      metrics,
      charts,
      github,
      ai: aiResponse,
      user: {
        username: req.user.username,
        email: req.user.email,
        credits: req.user.credits,
        totalTests: req.user.totalTests,
        lastSessionId: req.user.lastSessionId,
        subscription: {
          ...req.user.subscription.toObject(),
          daysLeft: req.user.subscription.expiry ? Math.max(0, Math.ceil((new Date(req.user.subscription.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0
        }
      }
    });

  } catch (err) {
    console.error("❌ Load Test Runner Error:", err);
    res.status(500).json({ success: false, error: "Load test execution failed" });
  }
});

// GET Latest Test Result -> GET /api/load-test/latest
router.get("/latest", async (req, res) => {
  try {
    const sessionId = req.user.lastSessionId;
    if (!sessionId) return res.status(404).json({ error: "No test history found" });

    // Validate ObjectId (Legacy UUID check)
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(404).json({ error: "Previous test data incompatible/missing. Run a new test." });
    }

    const session = await TestSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Latest report data expired" });

    res.json({
      id: session._id,
      url: session.url,
      metrics: session.metrics,
      charts: session.charts,
      healthData: session.healthData,
      github: session.github,
      ai: session.ai,
      aiVerdict: session.ai?.verdict || "Passed"
    });
  } catch (err) {
    console.error("❌ Get Latest Test Error:", err);
    res.status(500).json({ error: "Failed to fetch latest test" });
  }
});

// 2. GET Test Result by ID (STRICT REGEX)
router.get("/:id([0-9a-fA-F]{24})", async (req, res) => {
  try {
    const session = await TestSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Report not found" });

    res.json({
      id: session._id,
      url: session.url,
      metrics: session.metrics,
      charts: session.charts,
      github: session.github,
      ai: session.ai,
      aiVerdict: session.ai?.verdict || "Passed"
    });
  } catch (err) {
    console.error("❌ Get Test ID Error:", err);
    res.status(500).json({ error: "Failed to fetch test report" });
  }
});

export default router;


//frontend
return res.json({
  success: true,
  sessionId: sessionKey,
  metrics,
  charts,
  github,
  ai: { message: aiMessage }
});

