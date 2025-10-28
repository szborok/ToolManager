// processDaily.js
/**
 * Daily File Processing CLI
 * Handles the daily matrix files received via email
 */

const ProcessingManager = require("./src/ProcessingManager");
const Logger = require("./utils/Logger");
const config = require("./config");

async function main() {
  console.log("🚀 Starting Daily File Processor...");

  try {
    // Initialize configuration and logging
    config.initialize();
    Logger.setupFileNaming();

    const manager = new ProcessingManager();

    // Process command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || "process";

    switch (command) {
      case "process":
        console.log("📊 Processing all new matrix files...");
        const filesToProcess = config.getPath("filesToProcess");
        const result = await manager.processBatch(filesToProcess, {
          source: "daily",
          moveAfterProcessing: true,
          generateReports: true,
        });

        if (result.success) {
          console.log("\n✅ Processing completed successfully!");
          console.log(`Files processed: ${result.totalFiles}`);
          console.log(`Successful: ${result.successful}`);
          console.log(`Failed: ${result.failed}`);

          if (result.results && result.results.length > 0) {
            console.log("\n📋 Processing Details:");
            result.results.forEach((fileResult) => {
              if (fileResult.success) {
                console.log(
                  `  ✓ ${fileResult.sourceFile}: ${fileResult.toolCount} tools`
                );
              } else {
                console.log(
                  `  ❌ ${fileResult.sourceFile}: ${fileResult.error}`
                );
              }
            });
          }
        } else {
          console.log("❌ Processing failed:", result.error || result.message);
        }
        break;

      case "watch":
        console.log("👀 Starting file watcher...");
        const watchResult = await manager.startFolderWatching();

        if (watchResult.success) {
          console.log(
            `✅ Watching folders: ${watchResult.watching.join(", ")}`
          );
          console.log(
            "📝 Monitoring for new Excel files... (Press Ctrl+C to stop)"
          );

          // Keep process alive
          process.on("SIGINT", async () => {
            console.log("\n🛑 Stopping file watcher...");
            await manager.stopProcessing();
            console.log("✅ Stopped successfully");
            process.exit(0);
          });

          // Keep alive
          setInterval(() => {}, 1000);
        } else {
          console.log(`❌ Failed to start file watcher: ${watchResult.reason}`);
        }
        break;

      case "stats":
        console.log("📊 Daily Processing Statistics:");

        // Show processing status
        console.log("\n" + "=".repeat(50));

        // Get stats from registry
        const workTrackingDir = config.getPath("workTracking");
        const registryFile = require("path").join(
          workTrackingDir,
          "processed_files_registry.json"
        );
        const fs = require("fs");

        if (fs.existsSync(registryFile)) {
          const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
          const entries = Object.values(registry);

          const today = new Date().toDateString();
          const todayEntries = entries.filter(
            (e) => new Date(e.processedAt).toDateString() === today
          );

          console.log(`📅 Today's Processing: ${todayEntries.length} files`);
          console.log(`📈 Total Processed: ${entries.length} files`);

          if (todayEntries.length > 0) {
            const totalTools = todayEntries.reduce(
              (sum, e) => sum + (e.toolCount || 0),
              0
            );
            console.log(`🔧 Tools Processed Today: ${totalTools}`);

            console.log("\n📋 Today's Files:");
            todayEntries.forEach((entry) => {
              const status = entry.success ? "✅" : "❌";
              const time = new Date(entry.processedAt).toLocaleTimeString();
              console.log(
                `  ${status} ${entry.fileName} (${entry.toolCount} tools) - ${time}`
              );
            });
          }
        } else {
          console.log("📝 No processing history found");
        }
        break;

      default:
        console.log("❓ Unknown command. Available commands:");
        console.log("  process - Process all new matrix files");
        console.log("  watch   - Start file watcher for continuous processing");
        console.log("  stats   - Show daily processing statistics");
        break;
    }
  } catch (error) {
    Logger.error(`Daily processor error: ${error.message}`);
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  Logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  Logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
