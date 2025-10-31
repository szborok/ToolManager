// path: src/Executor.js
/**
 * The Executor orchestrates the full process:
 * scanning Excel files, analyzing tools, and generating work tracking results.
 */

const config = require("../config");
const Logger = require("../utils/Logger");
const Scanner = require("./Scanner");
const Analyzer = require("./Analyzer");
const Results = require("./Results");

class Executor {
  constructor(dataManager = null) {
    this.dataManager = dataManager;
    this.scanner = new Scanner();
    this.analyzer = new Analyzer();
    this.results = new Results(dataManager);
    this.isRunning = false;
    this.manualQueue = [];
  }

  /**
   * Start the entire process (autorun or manual).
   * @param {Object} options - Command line options
   */
  async start(options = {}) {
    if (this.isRunning) {
      Logger.warn("Executor already running.");
      return;
    }

    this.isRunning = true;

    Logger.info(
      `Executor started (${config.app.autoMode ? "AUTO" : "MANUAL"} mode).`
    );

    this.scanner.start();

    if (config.app.autoMode) {
      await this.runAutorunCycle();
    } else if (options.projectPath) {
      // Manual mode with specific project path
      await this.runManualProject(options.projectPath);
    } else {
      // Manual mode - use path resolution (test mode or user input)
      await this.runManualMode();
    }
  }

  /**
   * Runs continuously when automode is true.
   * Waits for new Excel files and processes them sequentially.
   */
  async runAutorunCycle() {
    let scanCount = 0;

    while (this.isRunning && config.app.autoMode) {
      scanCount++;
      const scanStartTime = new Date();

      Logger.info(
        `🔄 Auto Scan #${scanCount} - Starting at ${scanStartTime.toLocaleTimeString()}`
      );

      // Clear previous projects and scan
      this.scanner.projects = [];
      this.scanner.performScan();

      const projects = this.scanner.getProjects();
      const scanEndTime = new Date();
      const scanDuration = scanEndTime.getTime() - scanStartTime.getTime();

      Logger.info(
        `✅ Auto Scan #${scanCount} - Completed at ${scanEndTime.toLocaleTimeString()} (took ${scanDuration}ms)`
      );

      if (projects.length > 0) {
        Logger.info(
          `📊 Processing ${projects.length} Excel file(s) found in scan #${scanCount}`
        );
      } else {
        Logger.info(`📭 No new Excel files found in scan #${scanCount}`);
      }

      for (const project of projects) {
        if (project.status === "ready") {
          await this.processProject(project);
        }
      }

      // Wait before scanning again with countdown
      if (this.isRunning && config.app.autoMode) {
        await this.waitWithCountdown(config.app.scanIntervalMs, scanCount);
      }
    }
  }

  /**
   * Process a project: analyze -> rule check -> results.
   */
  async processProject(project) {
    try {
      Logger.info(`Processing project: ${project.getFullName()}`);

      // Step 1: Analyze the Excel file (validate and extract data)
      this.analyzer.analyzeProject(project);

      if (project.status === "analysis_failed") {
        Logger.error(`Analysis failed for project: ${project.getFullName()}`);
        // Set up minimal analysis results for failed analysis
        project.setAnalysisResults({});
        this.results.saveProjectResults(project, project.getAnalysisResults());
        return;
      }

      // Check for fatal errors after analysis
      if (project.status === "fatal_error") {
        Logger.error(
          `❌ Project has fatal errors and cannot be processed: ${project.getFullName()}`
        );
        return;
      }

      // Step 2: Identify and categorize tools, generate work tracking data
      const toolResults = this.analyzer.processToolIdentification(project);

      // Step 3: Store analysis results in project
      project.setAnalysisResults(toolResults);

      // Step 4: Save results to file
      this.results.saveProjectResults(project, project.getAnalysisResults());

      // Step 5: Log summary for monitoring
      this.logProjectSummary(project, toolResults);

      Logger.info(
        `Project completed: ${project.getFullName()} - Status: ${
          project.analysisResults.summary.overallStatus
        }`
      );
      project.status = "completed";
    } catch (err) {
      Logger.error(`Project processing failed: ${err.message}`);

      // Check if this is a critical error that should mark project as fatal
      if (
        err.message.includes("Excel") ||
        err.message.includes("parse") ||
        err.message.includes("corrupt")
      ) {
        project.markAsFatalError(`Processing failed: ${err.message}`);
        project.status = "fatal_error";
        Logger.error(
          `❌ Project marked as fatal error due to critical failure`
        );
      } else {
        // For other errors, mark as failed but still save results to avoid retrying
        project.status = "failed";
        project.setAnalysisResults({}); // Empty results
        this.results.saveProjectResults(project, project.getAnalysisResults());
        Logger.error(`❌ Project failed but result saved to prevent retry`);
      }
    }
  }

  /**
   * Queue a manual project for execution.
   * Will pause autorun after the current project.
   * @param {string} projectPath - Path to Excel file to process
   */
  async runManualProject(projectPath) {
    Logger.info(`Manual run requested for: ${projectPath}`);

    if (config.app.autoMode) {
      Logger.warn("Autorun active — will pause after current project.");
      config.app.autoMode = false;
    }

    this.manualQueue.push({ path: projectPath });

    // Wait for any running project to finish
    while (this.isRunning) await new Promise((res) => setTimeout(res, 1000));

    try {
      this.scanner.scanProject(projectPath);
      const projects = this.scanner.getProjects();

      // Process the most recently added project
      const latestProject = projects[projects.length - 1];
      if (latestProject && latestProject.status === "ready") {
        await this.processProject(latestProject);
      } else {
        Logger.warn(`No valid project found at: ${projectPath}`);
      }
    } catch (err) {
      Logger.error(`Manual project processing failed: ${err.message}`);
    }

    Logger.info("Manual project finished. Resuming autorun...");
    config.app.autoMode = true;
    await this.start();
  }

  /**
   * Run manual mode with automatic path resolution (test mode or user input).
   */
  async runManualMode() {
    try {
      Logger.info(
        `Starting manual mode (${config.app.testMode ? "TEST" : "PRODUCTION"})`
      );

      // Use the scanner's path resolution method
      await this.scanner.scanWithPathResolution();

      const projects = this.scanner.getProjects();

      if (projects.length === 0) {
        Logger.warn("No projects found to process.");
        return;
      }

      Logger.info(
        `Found ${projects.length} project(s) to process in manual mode.`
      );

      for (const project of projects) {
        if (project.status === "ready") {
          await this.processProject(project);
        }
      }

      Logger.info("Manual mode processing completed.");
    } catch (err) {
      Logger.error(`Manual mode failed: ${err.message}`);
    }
  }

  /**
   * Wait with countdown display.
   */
  async waitWithCountdown(ms, scanNumber) {
    const intervalSeconds = Math.floor(ms / 1000);
    Logger.info(`⏱️  Waiting ${intervalSeconds} seconds before next scan...`);

    for (let i = intervalSeconds; i > 0; i--) {
      if (!this.isRunning || !config.app.autoMode) break;

      if (i <= 10 || i % 10 === 0) {
        Logger.info(`⏱️  Next scan in ${i} seconds...`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  /**
   * Log project processing summary.
   */
  logProjectSummary(project, results) {
    const summary = results.summary || {};
    Logger.info(`📊 Project Summary for ${project.getFullName()}:`);
    Logger.info(`   - Status: ${summary.overallStatus || "unknown"}`);
    Logger.info(`   - Tools Processed: ${summary.toolsProcessed || 0}`);
    Logger.info(`   - Warnings: ${summary.warningCount || 0}`);
    Logger.info(`   - Errors: ${summary.errorCount || 0}`);
  }

  /**
   * Stop the executor.
   */
  stop() {
    Logger.info("Stopping Executor...");
    this.isRunning = false;
    this.scanner.stop();
  }
}

module.exports = Executor;
