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
    demo: false,
    listResults: false,
    exportResults: null,
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
      case "--demo-temp":
        options.demo = true;
        break;
      case "--list-results":
        options.listResults = true;
        break;
      case "--export-results":
        options.exportResults = args[i + 1];
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

async function runSetup() {
  const fs = require("fs");
  const path = require("path");

  console.log("🔧 Setting up ToolManager directories...");

  const createDirectory = (dirPath, description) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created ${description}: ${dirPath}`);
    } else {
      console.log(`✓ ${description} exists: ${dirPath}`);
    }
  };

  try {
    // Create test processed data directory
    createDirectory(
      config.app.testProcessedDataPath,
      "Test processed data directory"
    );

    // Create working directories for test mode
    if (config.app.testMode) {
      createDirectory(
        config.paths.test.filesToProcess,
        "Test files to process"
      );
      createDirectory(
        config.paths.test.filesProcessed,
        "Test processed files archive"
      );
      createDirectory(config.paths.test.workTracking, "Test work tracking");
      createDirectory(config.paths.test.analysis, "Test analysis output");
    }

    console.log("✅ Setup completed successfully");
    console.log(
      `📁 Test mode: ${config.app.testMode ? "ENABLED" : "DISABLED"}`
    );
    console.log(`📁 Temp processing: ${config.app.testProcessedDataPath}`);
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    throw error;
  }
}

function cleanDemoWorkingFolder() {
  const fs = require("fs");
  const path = require("path");

  try {
    const demoPath = config.app.testProcessedDataPath;
    const brkPath = path.join(demoPath, "BRK CNC Management Dashboard");

    if (fs.existsSync(brkPath)) {
      console.log("🧹 Cleaning demo working folder...");

      // Remove contents but preserve folder structure
      const removeContents = (dirPath) => {
        if (fs.existsSync(dirPath)) {
          const items = fs.readdirSync(dirPath);
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
              removeContents(itemPath); // Recursive
              try {
                fs.rmdirSync(itemPath);
              } catch (e) {
                // Directory not empty, that's ok
              }
            } else {
              fs.unlinkSync(itemPath);
            }
          }
        }
      };

      removeContents(brkPath);
      console.log("✅ Demo working folder cleaned successfully");
    } else {
      console.log("ℹ️  Demo working folder already clean");
    }
  } catch (error) {
    console.log("⚠️  Could not clean demo working folder:", error.message);
  }
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
  --demo-temp          Run temp processing demonstration (read-only by design)
  --list-results       List all result files in current temp session
  --export-results <dir> Export current temp results to specified directory
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
      await runSetup();
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

    if (options.demo) {
      console.log("🎯 Running ToolManager temp processing demonstration...");
      console.log(
        "📁 All processing will use organized temp structure (read-only by design)"
      );

      // Clean previous demo data
      cleanDemoWorkingFolder();

      // Load the demo functionality from archived demo file
      const demoModule = require("./archive/demo-temp-organized");
      await demoModule.runDemo();

      // Clean up after demo
      cleanDemoWorkingFolder();
      console.log("✅ Demo completed successfully");
      process.exit(0);
    }

    if (options.listResults) {
      console.log("📋 Listing current temp session results...");
      // TODO: Implement result listing functionality
      console.log("ℹ️  Result listing not yet implemented");
      process.exit(0);
    }

    if (options.exportResults) {
      console.log(`📤 Exporting temp results to: ${options.exportResults}`);
      // TODO: Implement result export functionality
      console.log("ℹ️  Result export not yet implemented");
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
      console.log(
        `📁 Using user-defined working folder: ${options.workingFolder}`
      );
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
