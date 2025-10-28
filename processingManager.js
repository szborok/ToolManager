// processingManager.js
/**
 * Excel Processing Manager CLI
 * Provides unified interface for all Excel processing modes
 */
const ProcessingManager = require("./src/ProcessingManager");
const config = require("./config");
const Logger = require("./utils/Logger");

class ProcessingManagerCLI {
  constructor() {
    this.manager = new ProcessingManager();
    config.initialize();
    Logger.setupFileNaming();
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log("🔧 ToolManager - Excel Processing Manager");
    console.log("========================================\n");

    try {
      switch (command) {
        case "watch":
          await this.startFolderWatching();
          break;

        case "manual":
          await this.processManualFile(
            args[1],
            this.parseOptions(args.slice(2))
          );
          break;

        case "batch":
          await this.processBatch(args[1], this.parseOptions(args.slice(2)));
          break;

        case "schedule":
          await this.startScheduledProcessing(this.parseOptions(args.slice(1)));
          break;

        case "email":
          await this.startEmailProcessing(this.parseOptions(args.slice(1)));
          break;

        case "status":
          this.showStatus();
          break;

        case "stop":
          await this.stopProcessing();
          break;

        case "help":
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      Logger.error(`CLI Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Start folder watching mode
   */
  async startFolderWatching() {
    console.log("🔍 Starting folder watching mode...");

    const result = await this.manager.startFolderWatching();

    if (result.success) {
      console.log("✅ Folder watching started successfully");
      console.log(`📁 Watching folders: ${result.watching.join(", ")}`);
      console.log(
        "\n📝 Monitoring for new Excel files... (Press Ctrl+C to stop)"
      );

      // Keep process alive
      process.on("SIGINT", async () => {
        console.log("\n🛑 Stopping folder watching...");
        await this.manager.stopProcessing();
        console.log("✅ Stopped successfully");
        process.exit(0);
      });

      // Keep alive
      setInterval(() => {}, 1000);
    } else {
      console.log(`❌ Failed to start folder watching: ${result.reason}`);
    }
  }

  /**
   * Process manual file
   */
  async processManualFile(filePath, options = {}) {
    if (!filePath) {
      console.log("❌ Please provide file path for manual processing");
      console.log(
        "Usage: node processingManager.js manual <file-path> [options]"
      );
      return;
    }

    console.log(`📄 Processing manual file: ${filePath}`);

    const result = await this.manager.processManualFile(filePath, options);

    if (result.success) {
      console.log("✅ Manual processing completed successfully");
      console.log(`📊 Tools processed: ${result.toolCount}`);
      console.log(`💾 Output saved to: ${result.outputFile}`);
    } else {
      console.log(`❌ Manual processing failed: ${result.error}`);
    }
  }

  /**
   * Process batch files
   */
  async processBatch(source, options = {}) {
    if (!source) {
      console.log(
        "❌ Please provide source folder or file list for batch processing"
      );
      console.log(
        "Usage: node processingManager.js batch <folder-path> [options]"
      );
      return;
    }

    console.log(`📦 Starting batch processing from: ${source}`);

    const result = await this.manager.processBatch(source, options);

    if (result.success) {
      console.log("✅ Batch processing completed");
      console.log(`📊 Files processed: ${result.totalFiles}`);
      console.log(`✅ Successful: ${result.successful}`);
      console.log(`❌ Failed: ${result.failed}`);
    } else {
      console.log(`❌ Batch processing failed: ${result.error}`);
    }
  }

  /**
   * Start scheduled processing
   */
  async startScheduledProcessing(options = {}) {
    console.log("⏰ Starting scheduled processing...");

    const result = await this.manager.startScheduledProcessing(options);

    if (result.success) {
      console.log("✅ Scheduled processing configured");
      console.log(
        `📅 Schedule: ${result.schedule.interval} at ${result.schedule.time}`
      );
    } else {
      console.log(`❌ Failed to start scheduled processing: ${result.reason}`);
    }
  }

  /**
   * Start email processing
   */
  async startEmailProcessing(options = {}) {
    console.log("📧 Starting email processing...");

    const result = await this.manager.startEmailProcessing(options);

    if (result.success) {
      console.log("✅ Email processing framework ready");
      console.log(
        "⚠️  Note: Email integration requires additional configuration"
      );
    } else {
      console.log(`❌ Failed to start email processing: ${result.reason}`);
    }
  }

  /**
   * Show current status
   */
  showStatus() {
    const status = this.manager.getStatus();

    console.log("📊 Processing Status:");
    console.log("====================");
    console.log(
      `🔍 Folder Watching: ${
        status.folderWatching ? "✅ Active" : "❌ Inactive"
      }`
    );
    console.log(
      `📧 Email Processing: ${
        status.emailProcessing ? "✅ Active" : "❌ Inactive"
      }`
    );
    console.log(
      `⏰ Scheduled Processing: ${
        status.scheduledProcessing ? "✅ Active" : "❌ Inactive"
      }`
    );
    console.log(`📝 Manual Queue: ${status.manualQueueLength} items`);
  }

  /**
   * Stop all processing
   */
  async stopProcessing() {
    console.log("🛑 Stopping all processing modes...");
    await this.manager.stopProcessing();
    console.log("✅ All processing modes stopped");
  }

  /**
   * Parse command line options
   */
  parseOptions(args) {
    const options = {};

    for (let i = 0; i < args.length; i += 2) {
      const key = args[i]?.replace(/^--/, "");
      const value = args[i + 1];

      if (key && value) {
        // Convert some common option types
        if (value === "true") options[key] = true;
        else if (value === "false") options[key] = false;
        else if (!isNaN(value)) options[key] = Number(value);
        else options[key] = value;
      }
    }

    return options;
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🔧 ToolManager Excel Processing Modes
=====================================

AVAILABLE PROCESSING MODES:

📁 1. Folder Watching (Hot Folder)
   node processingManager.js watch
   → Monitors folder for new Excel files and processes automatically

📄 2. Manual File Processing  
   node processingManager.js manual <file-path> [options]
   → Process specific Excel file on-demand
   Options: --moveAfterProcessing true/false --generateReport true/false

📦 3. Batch Processing
   node processingManager.js batch <folder-path> [options]
   → Process multiple Excel files from folder
   Options: --parallel true/false --maxConcurrent 3 --delayBetweenFiles 1000

⏰ 4. Scheduled Processing
   node processingManager.js schedule [options]
   → Process files on schedule (daily, hourly, custom)
   Options: --interval daily --time 06:00 --enabled true

📧 5. Email Processing (Framework Ready)
   node processingManager.js email [options]
   → Process Excel files from email attachments
   Options: --server imap.server.com --username user --pattern ".*Matrix.*"

📊 UTILITY COMMANDS:

   node processingManager.js status    → Show current processing status
   node processingManager.js stop      → Stop all active processing
   node processingManager.js help      → Show this help

💡 EXAMPLES:

   # Watch folder for new files
   node processingManager.js watch

   # Process single file manually
   node processingManager.js manual "./test_data/filesToProcess/Matrix.xlsx"

   # Batch process all files in folder
   node processingManager.js batch "./test_data/filesToProcess/"

   # Start scheduled daily processing at 6 AM
   node processingManager.js schedule --interval daily --time 06:00 --enabled true

📝 CONFIGURATION:
   Edit companyConfig/config.properties to customize processing settings
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new ProcessingManagerCLI();
  cli.run();
}

module.exports = ProcessingManagerCLI;
