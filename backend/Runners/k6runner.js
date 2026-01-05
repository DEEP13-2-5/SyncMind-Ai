import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Runs a k6 load test
 * @param {string} testURL - target URL
 * @param {object} options - load config
 * @param {number} options.vus - virtual users
 * @param {string} options.duration - test duration (e.g. "30s", "1m")
 */
export const runK6Test = (
  testURL,
  { vus = 100, duration = "30s" } = {}
) => {
  return new Promise((resolve, reject) => {
    try {
      const tempDir = os.tmpdir();
      const resultFile = path.join(
        tempDir,
        `k6-result-${Date.now()}.json`
      );

      // Resolve absolute path to test script to avoid CWD issues
      const scriptPath = path.resolve(process.cwd(), "loadtester/k6/test.js");

      // Construct single-line command
      const cmd = `k6 run --summary-export="${resultFile}" --env TARGET_URL="${testURL}" --env VUS="${vus}" --env DURATION="${duration}" "${scriptPath}"`;

      console.log(`🚀 Executing K6: ${cmd}`);

      exec("k6 version", (verErr, verStdout) => {
        if (verErr) {
          console.error("❌ K6 Binary not found or not executable:", verErr.message);
          return reject(new Error("k6 performance engine is not installed on the server environment."));
        }
        console.log(`✅ Running with K6: ${verStdout.trim()}`);

        exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ K6 Exec Error: ${error.message}`);
            console.error(`Stderr: ${stderr}`);
            return reject(
              new Error(`k6 execution failed: ${error.message}`)
            );
          }

          try {
            if (!fs.existsSync(resultFile)) {
              console.error("❌ K6 Result file missing at:", resultFile);
              return reject(new Error("K6 output file not found. The test may have crashed without output."));
            }
            const rawData = fs.readFileSync(resultFile, "utf-8");
            fs.unlinkSync(resultFile); // cleanup
            resolve(JSON.parse(rawData));
          } catch (err) {
            reject(
              new Error(`Failed to read k6 output: ${err.message}`)
            );
          }
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};
