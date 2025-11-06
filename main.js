// main.js
const Executor = require("./src/Executor");
const DataManager = require("./src/DataManager");
const Logger = require("./utils/Logger");
const config = require("./config");

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    mode: config.app.autoMode ? "auto" : "manual",
    projectPath: null,
    forceReprocess: false,
    cleanup: false,
    cleanupStats: false,
    setup: false,
    workingFolder: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--mode":
        options.mode = args[i + 1];
        i++; // Skip next argument
        break;
      case "--manual":
        options.mode = "manual";
        break;
      case "--auto":
        options.mode = "auto";
        break;
      case "--cleanup":
        options.cleanup = true;
        break;
      case "--cleanup-stats":
        options.cleanupStats = true;
        break;
      case "--project":
        options.projectPath = args[i + 1];
        i++; // Skip next argument
        break;
      case "--force":
        options.forceReprocess = true;
        break;
      case "--setup":
        options.setup = true;
        break;
      case "--working-folder":
        options.workingFolder = args[i + 1];
        i++; // Skip next argument
        break;
      case "--help":
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
ToolManager Application

Usage: node main.js [options]

Options:
  --mode <auto|manual> Override config mode setting
  --manual             Set mode to manual (shortcut for --mode manual)
  --auto               Set mode to auto (shortcut for --mode auto)
  --cleanup            Delete all generated files and work tracking items
  --cleanup-stats      Show statistics about generated files without deleting
  --project <path>     Process specific Excel file path (manual mode only)
  --force              Force reprocess even if result files exist
  --setup              Run setup and configuration verification
  --working-folder <path> Override temp directory with user-defined working folder
  --help               Show this help message

Test Mode Information:
  Test mode is currently ${
    config.app.testMode ? "ENABLED" : "DISABLED"
  } (configured in config.js)
  
  AUTO mode paths:
    - Test mode: ${config.paths.test.filesToProcess}
    - Production mode: ${config.paths.production.filesToProcess}
  
  MANUAL mode paths:
    - Test mode: Uses ${config.paths.test.filesToProcess}
    - Production mode: Uses ${config.paths.production.filesToProcess}

Purpose:
  ToolManager processes Excel matrix files to:
  - Identify and categorize CNC tools (ECUT, MFC, XF, XFEED)
  - Generate work tracking JSON files for upcoming tool needs
  - Compare tool requirements against available inventory
  - Support manufacturing planning and tool management

Read-Only Operation:
  ✅ Original files are NEVER modified
  ✅ All processing uses organized temp structure
  ✅ Results saved to temp/BRK CNC Management Dashboard/ToolManager/
  ✅ Use --working-folder to specify custom temp location

Examples:
  node main.js --manual --project "path/to/matrix.xlsx"
  node main.js --auto --force
  node main.js --cleanup (removes all generated files)
  node main.js --setup (run initial setup)
  node main.js --working-folder "D:/CNC_Processing" (custom temp location)
  `);
}

async function main() {
  try {
    console.log("🚀 Starting ToolManager Application...");

    // Initialize configuration
    if (typeof config.initialize === "function") {
      config.initialize();
    }
    console.log("✓ Configuration loaded successfully");

    // Set up logging
    Logger.setupFileNaming();
    Logger.info("ToolManager Application started");

    // Parse command line arguments
    const options = parseArguments();

    // Handle special operations first
    if (options.setup) {
      console.log("🔧 Running setup...");
      const setup = require("./setup");
      await setup.run();
      process.exit(0);
    }

    if (options.cleanup || options.cleanupStats) {
      console.log(
        options.cleanup
          ? "🧹 Cleaning up generated files..."
          : "📊 Showing cleanup statistics..."
      );
      const CleanupService = require("./utils/CleanupService");
      const cleanup = new CleanupService();

      if (options.cleanupStats) {
        cleanup.showStats();
      } else {
        await cleanup.cleanup();
      }
      process.exit(0);
    }

    // Apply command line overrides to config
    if (options.mode === "auto") {
      config.app.autoMode = true;
    } else if (options.mode === "manual") {
      config.app.autoMode = false;
    }

    if (options.forceReprocess) {
      config.processing.preventReprocessing = false;
    }
    
    // Apply working folder override if provided
    if (options.workingFolder) {
      config.app.userDefinedWorkingFolder = options.workingFolder;
      console.log(`📁 Using user-defined working folder: ${options.workingFolder}`);
    }

    // Create and initialize DataManager
    console.log("📊 Initializing data storage...");
    const dataManager = new DataManager();
    await dataManager.initialize();

    // Create and start executor
    const executor = new Executor(dataManager);
    await executor.start(options);
  } catch (err) {
    Logger.error(`Application failed: ${err.message}`);
    console.error(`❌ Application failed: ${err.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  Logger.info("Received SIGINT, shutting down gracefully...");
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  Logger.info("Received SIGTERM, shutting down gracefully...");
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
});

// Run the application
if (require.main === module) {
  main();
}
