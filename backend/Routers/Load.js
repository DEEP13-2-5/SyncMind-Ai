import express from "express";
import mongoose from "mongoose";
import { runK6Test } from "../Runners/k6runner.js";
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
    console.log(`🚀 Running Load Test for: ${testURL || githubRepo}`);
    console.log(`📦 GitHub Repo provided: ${githubRepo || 'NONE'}`);

    if (!testURL && !githubRepo) {
      return res.status(400).json({ error: "Provide testURL or githubRepo" });
    }

    console.log("⏱ Starting synchronized analysis (K6 + GitHub)...");

    // Run both in parallel to save time and avoid timeouts
    const [testResult, githubResult] = await Promise.all([
      testURL
        ? runK6Test(testURL, { vus: 100, duration: "5s" }).catch(e => {
          console.error("⚠️ K6 Test Failed:", e);
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

    console.log("✅ Parallel analysis finished.");

    let metrics = null;
    let charts = null;
    let github = githubResult;

    if (testResult) {
      console.log("📊 Raw K6 Result keys:", Object.keys(testResult));
      if (testResult.metrics) {
        console.log("📊 K6 Metrics keys:", Object.keys(testResult.metrics));
        // Log a sample metric to verify structure
        console.log("📊 Sample http_reqs:", JSON.stringify(testResult.metrics.http_reqs, null, 2));
      } else {
        console.warn("⚠️ K6 Result invalid: No metrics found");
      }

      metrics = parseK6Data(testResult);
      console.log("✅ Parsed Metrics:", JSON.stringify(metrics, null, 2));
      charts = buildChartResponse(metrics);
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
      context,
      getresponseopenrouter
    }) => {
      let aiResponseMsg = "SynthMind AI Verdict: Analysis pending...";

      if (!metrics) {
        return {
          message:
            "Load Test & Analysis Failed: The k6 performance engine could not collect metrics. This usually means the target URL is unreachable or the server environment is not configured correctly for load testing."
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
      context,
      getresponseopenrouter
    });
    const aiResponseMsg = aiResponse.message;

    // Create new session in DB
    console.log("💾 SAVING METRICS TO DB:", JSON.stringify(metrics, null, 2));
    const newSession = new TestSession({
      user: req.user._id,
      url: testURL || githubRepo,
      metrics,
      charts,
      github,
      ai: aiResponse,
      chatHistory: [{ role: "bot", content: aiResponseMsg }]
    });

    await newSession.save();
    const sessionId = newSession._id.toString();

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

