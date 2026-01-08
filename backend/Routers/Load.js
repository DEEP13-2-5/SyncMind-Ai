import express from "express";
import mongoose from "mongoose";
import { runK6Test } from "../Runners/k6runner.js";
import { runPlaywrightAudit } from "../Runners/playwrightRunner.js";
import { parseK6Data, buildChartResponse } from "../Utils/Loaddata.js";
import { analyzeGithubRepo } from "../Utils/githubAnalyzer.js";
import getresponseopenrouter from "../Utils/openrouter.js";
import { checkCreditsOrSub } from "../Middleware/authMiddleware.js";
import TestSession from "../Models/TestSession.js";

const router = express.Router();

// Run Load Test -> POST /api/load-test
router.post("/", checkCreditsOrSub, async (req, res) => {
  try {
    const { testURL, githubRepo } = req.body;

    if (!testURL && !githubRepo) {
      return res.status(400).json({ error: "Provide testURL or githubRepo" });
    }


    // console.log("⏱ Starting synchronized analysis (K6 + GitHub)...");

    // Run all in parallel to save time and avoid timeouts
    const [testResult, githubResult, playwrightResult] = await Promise.all([
      testURL
        ? runK6Test(testURL, { vus: 200, duration: "5s" }).catch(e => {
          console.error("⚠️ K6 Test Failed:", e);
          return null;
        })
        : Promise.resolve(null),
      githubRepo
        ? analyzeGithubRepo(githubRepo).catch(e => {
          console.error("⚠️ GitHub Analysis Failed:", e);
          return null;
        })
        : Promise.resolve(null),
      testURL
        ? runPlaywrightAudit(testURL).catch(e => {
          console.error("⚠️ Playwright Audit Failed:", e);
          return null;
        })
        : Promise.resolve(null)
    ]);


    // console.log("✅ Parallel analysis finished.");

    let metrics = null;
    let charts = null;
    let github = githubResult;

    if (testResult) {
      if (testResult) {
        metrics = parseK6Data(testResult);
        charts = buildChartResponse(metrics);
      }
    }

    if (github && github.summary) {
      // Calculate score if present
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

    if (playwrightResult) {
      context += `Browser Experience Audit (External):\n`;
      context += `- Performance Score: ${playwrightResult.performance}/100\n`;
      context += `- Accessibility Score: ${playwrightResult.accessibility}/100\n`;
      context += `- Best Practices Score: ${playwrightResult.bestPractices}/100\n`;
      context += `- SEO Score: ${playwrightResult.seo}/100\n`;
      context += `- Interactivity Score: ${playwrightResult.interactivity}/100\n`;
      if (playwrightResult.loadTimeMs) {
        context += `- Real Browser Load Time: ${playwrightResult.loadTimeMs} ms\n`;
      }
      context += `\n`;
    }

    // -------------------------------------------------------------------------
    // CALCULATE BUSINESS & STRATEGIC INSIGHTS (DETERMINISTIC FALLBACKS)
    // -------------------------------------------------------------------------
    const businessMetrics = {
      conversionLoss: 0,
      adSpendRisk: 0,
      stabilityRiskScore: 0,
      remediations: [],
      collapsePoint: 0
    };

    if (metrics) {
      // 1s delay = ~7% conversion loss (Formula: latency / 1000 * 7)
      businessMetrics.conversionLoss = parseFloat(((safeNumber(metrics.latency?.avg, 0) / 1000) * 7).toFixed(1));

      // Ad spend risk (Formula: failure rate * throughput multiplier)
      businessMetrics.adSpendRisk = Math.round(metrics.failureRateUnderTest * metrics.throughput * 150 * 5); // Rough multiplier

      // Stability Score (0-100)
      businessMetrics.stabilityRiskScore = Math.max(0, 100 - (metrics.failureRateUnderTest * 500) - (metrics.latency?.p95 / 20));

      // Collapse Point Estimation
      businessMetrics.collapsePoint = Math.round(metrics.vus * (metrics.failureRateUnderTest > 0.05 ? 0.9 : 1.5));

      // Deterministic Remediation
      if (metrics.latency?.p95 > 500) businessMetrics.remediations.push("Enable CDN Edge Caching → -600ms p95 latency");
      if (metrics.throughput < 100) businessMetrics.remediations.push("Implement Redis Caching → +40% throughput throughput capacity");
      if (metrics.serverErrorRate > 0) businessMetrics.remediations.push("Auto-Scale Infrastructure → Neutralize service disruptions");
    }

    if (githubResult && !githubResult.cicd?.present) {
      businessMetrics.remediations.push("Setup CI/CD Pipeline → Reduce 3× outage risk during peak traffic");
    }

    // -------------------------------------------------------------------------
    // SYNTHMIND AI — LIVE AUDIT AGENTIC MODE
    // -------------------------------------------------------------------------
    const runLiveAuditAI = async ({
      metrics,
      context,
      getresponseopenrouter
    }) => {
      let aiResponseMsg = "SynthMind AI Verdict: Analysis pending...";

      if (!metrics) {
        return {
          message:
            "Load Test Failed: No runtime metrics were collected. The target may be unreachable."
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
You are SynthMind AI, a Brutally Honest Business Continuity & Risk Auditor. Your audience is Startup Founders and VCs who need the "Harsh Reality."

Your purpose is to provide an uncompromising audit based on **Simulated Load Tests (k6)**, **DevOps Signals (GitHub)**, and **Real-time Browser Audits (Playwright)**.

STRICT RULES:
1. TONE: Be direct, slightly "harsh." Call risks "fail-points" or "disaster points."
2. NO "ERROR" WORD: Use "System Disruption," "Fail-point," or "Integrity Breakdown."
3. BUSINESS IMPACT: You must translate metrics into MONEY and USERS. (e.g., "1s delay = 7% conversion loss", "Manual deploy = 3x higher outage risk").
4. REMEDIATION: You must provide exactly 2-3 high-impact actionable next steps (e.g. "Add caching -> +42% throughput").
5. KILLER VISUAL CONTEXT: Mention the "Collapse Point" where the product architecture fundamentally dies.
6. NO fixes or tech support. You are an Auditor.

If asked for help: "This interface provides business auditing only. Use Ask AI for remediation."
        `.trim()
          },
          {
            role: "user",
            content: `
${safeContext}

Generate the "Harsh Reality Executive Summary" strictly in this format:

**SynthMind AI Verdict**

Paragraph 1: The Business Reality (Launch Suitability)
Tell the founder exactly what their website does and what works. Map technical performance to conversion and revenue. (e.g. "At your current speed, you are burning 7% of potential revenue due to latency.")

Paragraph 2: The Actionable Remediation (Must-Do Now)
Provide the top 2-3 specific technical fixes that will lead to business gains. Format as: "Add [Feature] -> [Business Benefit]".

Paragraph 3: The Collapse Point (Strategic Risk)
Based on the data, what is the exact traffic volume where your current tech stack dies? Explain the disaster that follows.

Confidence Scope:
Runtime telemetry — High
Business Impact Mapping — High
Repository signals — Medium
Production inference — Not evaluated
        `.trim()
          }
        ];

        const response = await getresponseopenrouter(messages);

        aiResponseMsg =
          typeof response === "string" && response.trim().length > 0
            ? response.trim()
            : "**SynthMind AI Verdict**\n\nAnalysis completed. Refer to metrics.";

      } catch (err) {
        console.error("⚠️ Live Audit Agentic AI failed:", err);
        aiResponseMsg =
          "SynthMind AI could not generate the live audit.";
      }

      return {
        message: aiResponseMsg
      };
    };

    // --- EXECUTE AI ANALYSIS ---
    const aiResponse = await runLiveAuditAI({
      metrics,
      context,
      getresponseopenrouter
    });
    const aiResponseMsg = aiResponse.message;

    // Create new session in DB
    const newSession = new TestSession({
      user: req.user._id,
      url: testURL || githubRepo,
      metrics,
      browserMetrics: playwrightResult,
      charts,
      github,
      ai: {
        ...aiResponse,
        businessInsights: businessMetrics
      },
      chatHistory: [{ role: "bot", content: aiResponseMsg }]
    });

    await newSession.save();
    const sessionId = newSession._id.toString();

    // Save as last session for this user
    try {
      req.user.lastSessionId = sessionId;
      await req.user.save();

      // console.log(`💾 Last session ID (${sessionId}) saved for user: ${req.user.username}`);
    } catch (saveErr) {
      console.error("⚠️ Failed to save lastSessionId:", saveErr);
    }

    return res.json({
      success: true,
      id: sessionId,
      metrics,
      browserMetrics: newSession?.browserMetrics || playwrightResult,
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
      browserMetrics: session.browserMetrics,
      charts: session.charts,
      github: session.github,
      ai: session.ai,
      aiVerdict: "Passed" // Defaulting as before
    });
  } catch (err) {
    console.error("❌ Get Latest Test Error:", err);
    res.status(500).json({ error: "Failed to fetch latest test" });
  }
});

// GET Test Result -> GET /api/load-test/:id
router.get("/:id", async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await TestSession.findById(sessionId);

    if (!session) return res.status(404).json({ error: "Report not found" });

    res.json({
      id: session._id,
      url: session.url,
      metrics: session.metrics,
      browserMetrics: session.browserMetrics,
      charts: session.charts,
      github: session.github,
      ai: session.ai,
      aiVerdict: "Passed"
    });
  } catch (err) {
    console.error("❌ Get Test Error:", err);
    res.status(500).json({ error: "Failed to fetch test report" });
  }
});

export default router;


//frontend
// return res.json({
//   success: true,
//   sessionId: sessionKey,
//   metrics,
//   charts,
//   github,
//   ai: { message: aiMessage }
// });

