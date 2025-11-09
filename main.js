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
    test: false,
    testRuns: 1,
    testQuick: false,
    testStorage: false,
    listResults: false,
    exportResults: null,
    // Debug and test flags
    debug: false,
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
      case "--test":
        options.test = true;
        // Check if next argument is a number for multiple runs
        if (
          i + 1 < args.length &&
          args[i + 1].startsWith("--") &&
          args[i + 1].length > 2
        ) {
          const numStr = args[i + 1].substring(2);
          const numRuns = parseInt(numStr, 10);
          if (!isNaN(numRuns) && numRuns > 0) {
            options.testRuns = numRuns;
            i++; // Skip the number argument
          }
        }
        break;
      case "--list-results":
        options.listResults = true;
        break;
      case "--export-results":
        options.exportResults = args[i + 1];
        i++; // Skip next argument
        break;
      case "--debug":
        options.debug = true;
        break;
      case "--test-quick":
        options.testQuick = true;
        break;
      case "--test-storage":
        options.testStorage = true;
        break;
      case "--help":
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

// List temp results
async function listTempResults() {
  const fs = require("fs");
  const path = require("path");

  try {
    const tempBasePath = path.join(
      config.app.testProcessedDataPath,
      "BRK CNC Management Dashboard",
      "ToolManager"
    );

    if (!fs.existsSync(tempBasePath)) {
      console.log("📋 No temp results found");
      return;
    }

    console.log(`📋 ToolManager Temp Results:`);
    console.log(`📁 Base Location: ${tempBasePath}`);
    console.log("");

    // Check all subdirectories for result files
    const subdirs = [
      "results",
      "input_files",
      "processed_files",
      "excel_files",
    ];
    let totalFiles = 0;

    for (const subdir of subdirs) {
      const dirPath = path.join(tempBasePath, subdir);
      if (fs.existsSync(dirPath)) {
        const files = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith(".json"));
        if (files.length > 0) {
          console.log(`� ${subdir}/ (${files.length} files):`);
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            console.log(
              `     - ${file} (${
                stats.size
              } bytes, ${stats.mtime.toLocaleString()})`
            );
            totalFiles++;
          }
        }
      }
    }

    if (totalFiles === 0) {
      console.log(`📄 No result files found in any subdirectories`);
    } else {
      console.log(`\n� Total: ${totalFiles} result files found`);
    }
  } catch (error) {
    console.error(`❌ Failed to list temp results: ${error.message}`);
  }
}

// Export temp results
async function exportTempResults(destinationDir) {
  const fs = require("fs");
  const path = require("path");

  try {
    const tempBasePath = path.join(
      config.app.testProcessedDataPath,
      "BRK CNC Management Dashboard",
      "ToolManager"
    );

    if (!fs.existsSync(tempBasePath)) {
      console.log("📋 No temp results to export");
      return;
    }

    // Create destination directory
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    // Check all subdirectories for result files
    const subdirs = [
      "results",
      "input_files",
      "processed_files",
      "excel_files",
    ];
    let totalExported = 0;

    for (const subdir of subdirs) {
      const dirPath = path.join(tempBasePath, subdir);
      if (fs.existsSync(dirPath)) {
        const jsonFiles = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith(".json"));
        if (jsonFiles.length > 0) {
          // Create subdirectory in destination
          const destSubdir = path.join(destinationDir, subdir);
          if (!fs.existsSync(destSubdir)) {
            fs.mkdirSync(destSubdir, { recursive: true });
          }

          console.log(
            `📁 Exporting ${jsonFiles.length} files from ${subdir}/...`
          );
          for (const file of jsonFiles) {
            const sourcePath = path.join(dirPath, file);
            const destPath = path.join(destSubdir, file);
            fs.copyFileSync(sourcePath, destPath);
            totalExported++;
            console.log(`   ✅ ${file}`);
          }
        }
      }
    }

    if (totalExported > 0) {
      console.log(
        `📤 Successfully exported ${totalExported} files to: ${destinationDir}`
      );
    } else {
      console.log("📋 No result files found to export");
    }
  } catch (error) {
    console.error(`❌ Failed to export temp results: ${error.message}`);
  }
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

    // Note: All actual processing happens in BRK temp structure
    // No need to create working_data directories - they're legacy/unused

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

function showHelp() {
  console.log(`
📊 ToolManager - CNC Tool Inventory Management System

Usage:
  node main.js [command] [options]

Commands:
  --auto               Continuous scanning mode (60s intervals)
  --manual --project   Process specific Excel file
  --test              Single test run with data preservation
  --test --N          Multiple test runs (e.g., --test --3)
  --setup             Initial configuration and verification
  --cleanup           Remove all generated BRK files
  --cleanup-stats     Show cleanup statistics without deletion
  --list-results      List current temp result files
  --export-results    Export temp results to directory
  --working-folder    Use custom working directory

Examples:
  node main.js --auto
  node main.js --manual --project "path/to/matrix.xlsx"
  node main.js --test
  node main.js --test --5
  node main.js --setup
  node main.js --cleanup-stats
  node main.js --list-results
  node main.js --export-results "/path/to/export"
  node main.js --working-folder "D:/Custom_Processing"
  node main.js --debug
  node main.js --test-quick
  node main.js --test-storage

Development & Testing:
  --debug              Debug utilities and log viewing
  --test               Run single test with cleanup (clean working folder after)
  --test --N           Run N test cycles with no cleanup between runs (e.g., --test --3)
  --test-quick         Run quick storage tests
  --test-storage       Run detailed storage functionality tests

Data Safety:
  • All processing uses organized temp structure
  • Original files are never modified
  • Test mode preserves data for analysis
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

    // Handle debug and test modes
    if (options.debug) {
      console.log("🐛 Starting debug utilities...");
      await runDebugUtilities();
      process.exit(0);
    }

    if (options.testQuick) {
      console.log("⚡ Running quick tests...");
      await runTestQuick();
      process.exit(0);
    }

    if (options.testStorage) {
      console.log("🗄️  Running storage tests...");
      await runTestStorage();
      process.exit(0);
    }

    if (options.test) {
      if (options.testRuns === 1) {
        console.log("🧪 Running single test with data preservation...");
        await runTest();
      } else {
        console.log(
          `🧪 Running ${options.testRuns} test cycles (no cleanup between runs)...`
        );
        await runMultipleTests(options.testRuns);
      }
      process.exit(0);
    }

    if (options.listResults) {
      console.log("📋 Listing current temp session results...");
      await listTempResults();
      process.exit(0);
    }

    if (options.exportResults) {
      console.log(`📤 Exporting temp results to: ${options.exportResults}`);
      await exportTempResults(options.exportResults);
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

async function runTest() {
  const Scanner = require("./src/Scanner");
  const Executor = require("./src/Executor");

  console.log("🧪 ToolManager Single Test Run");
  console.log("🗂️  BRK CNC Management Dashboard Structure");
  console.log("📌 Note: Test data preserved for inspection");
  console.log("================================================\n");

  let executor = null;
  let originalAutoMode = null;

  try {
    // Temporarily disable auto mode for test
    originalAutoMode = config.app.autoMode;
    config.app.autoMode = false;

    console.log("📂 Using test data from:", config.getJsonScanPath());
    console.log("📊 Excel inventory path:", config.getExcelScanPath());
    console.log("");

    // Create executor
    const dataManager = new DataManager();
    await dataManager.initialize();
    executor = new Executor(dataManager);

    console.log("🔄 Step 1: Scanning Excel and JSON files...");

    // Run one processing cycle
    await executor.start({ mode: "manual" });

    console.log("✅ Test run completed");
    console.log(
      "   📁 BRK CNC Management Dashboard/ToolManager structure maintained"
    );
    console.log("   🔄 Data preserved for inspection");
  } catch (error) {
    console.error("❌ Test run failed:", error.message);
  } finally {
    console.log("\n🔄 Data preserved for future test runs");
    if (executor) {
      await executor.stop();
    }

    // Restore original auto mode setting
    if (originalAutoMode !== null) {
      config.app.autoMode = originalAutoMode;
    }

    console.log("✅ Test run completed (data preserved)");
  }
}

async function runMultipleTests(numRuns) {
  console.log("🧪 ToolManager Multiple Test Runs");
  console.log("🗂️  BRK CNC Management Dashboard Structure");
  console.log("📌 Note: No cleanup between runs - data accumulates");
  console.log("================================================\n");

  let executor = null;
  let originalAutoMode = null;

  try {
    // Temporarily disable auto mode for test
    originalAutoMode = config.app.autoMode;
    config.app.autoMode = false;

    console.log("📂 Using test data from:", config.getJsonScanPath());
    console.log("📊 Excel inventory path:", config.getExcelScanPath());
    console.log("");

    const dataManager = new DataManager();
    await dataManager.initialize();

    for (let i = 1; i <= numRuns; i++) {
      console.log(`🔄 Test Run ${i}/${numRuns}: Scanning and processing...`);

      executor = new Executor(dataManager);
      await executor.start({ mode: "manual" });

      console.log(`✅ Run ${i}: Results saved to temp folder`);
      if (i < numRuns) {
        console.log("   🔄 Continuing to next run (no cleanup)...\n");
      }
    }

    console.log(`\n📋 All ${numRuns} test runs completed`);
    console.log(
      "   📁 BRK CNC Management Dashboard/ToolManager structure maintained"
    );
    console.log("   📂 Data accumulated for inspection");
  } catch (error) {
    console.error("❌ Multiple test runs failed:", error.message);
  } finally {
    console.log("\n🔄 Data preserved for future test runs");
    if (executor) {
      await executor.stop();
    }

    // Restore original auto mode setting
    if (originalAutoMode !== null) {
      config.app.autoMode = originalAutoMode;
    }

    console.log("✅ Test run completed (data preserved)");
  }
}

// Debug and test function implementations
async function runDebugUtilities() {
  const fs = require("fs");
  const path = require("path");

  function showLogFiles() {
    const logsDir = path.join(__dirname, "logs");

    if (!fs.existsSync(logsDir)) {
      console.log("📁 No logs directory found.");
      return;
    }

    const logFiles = fs
      .readdirSync(logsDir)
      .filter((file) => file.endsWith(".log"));

    if (logFiles.length === 0) {
      console.log("📝 No log files found.");
      return;
    }

    console.log("📝 Available log files:");
    logFiles.forEach((file, index) => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      console.log(
        `  ${index + 1}. ${file} (${Math.round(
          stats.size / 1024
        )}KB) - ${stats.mtime.toLocaleString()}`
      );
    });
  }

  function showLatestLogs(lines = 50) {
    const logsDir = path.join(__dirname, "logs");

    if (!fs.existsSync(logsDir)) {
      console.log("📝 No logs directory found.");
      return;
    }

    const logFiles = fs
      .readdirSync(logsDir)
      .filter((file) => file.endsWith(".log"))
      .sort()
      .reverse();

    if (logFiles.length === 0) {
      console.log("📝 No log files found.");
      return;
    }

    const latestLogFile = path.join(logsDir, logFiles[0]);
    const content = fs.readFileSync(latestLogFile, "utf8");
    const logLines = content.split("\n").filter((line) => line.trim());
    const recentLines = logLines.slice(-lines);

    console.log(
      `📝 Latest ${recentLines.length} log entries from ${logFiles[0]}:`
    );
    console.log("═".repeat(80));
    recentLines.forEach((line) => console.log(line));
  }

  console.log("🐛 ToolManager Debug Utilities");
  console.log("==============================\n");

  showLogFiles();
  console.log("");
  showLatestLogs(20);
}

async function runTestQuick() {
  console.log("🚀 Quick Storage Tests for ToolManager\n");

  try {
    // Test Local Storage
    process.env.STORAGE_TYPE = "local";
    const dm1 = new DataManager();
    await dm1.initialize();

    const testProject = {
      projectName: "test_local_quick_toolmanager",
      fileName: "test_matrix.xlsx",
      status: "active",
    };

    await dm1.saveProject(testProject);
    console.log("✅ ToolManager Local Storage: PASSED");

    // Test MongoDB if available
    try {
      process.env.STORAGE_TYPE = "mongodb";
      const dm2 = new DataManager();
      await dm2.initialize();

      const testProjectMongo = {
        projectName: "test_mongo_quick_toolmanager",
        fileName: "test_matrix.xlsx",
        status: "active",
      };

      await dm2.saveProject(testProjectMongo);
      console.log("✅ ToolManager MongoDB: PASSED");
    } catch (mongoError) {
      console.log("⚠️  ToolManager MongoDB: SKIPPED (not available)");
    }
  } catch (error) {
    console.error("❌ ToolManager tests failed:", error.message);
  }

  console.log("\n🎉 Quick tests completed!");
}

async function runTestStorage() {
  console.log("🧪 Testing ToolManager with LOCAL storage...");

  try {
    // Test local storage
    process.env.STORAGE_TYPE = "local";
    const dataManager = new DataManager();
    await dataManager.initialize();

    console.log("✅ Local storage initialized");

    // Test saving a project
    const testProject = {
      projectName: "storage_test_toolmanager",
      fileName: "test_matrix.xlsx",
      status: "active",
      timestamp: new Date().toISOString(),
    };

    await dataManager.saveProject(testProject);
    console.log("✅ Project saved successfully");

    // Test retrieving projects
    const projects = await dataManager.getAllProjects();
    console.log(`✅ Retrieved ${projects.length} project(s)`);

    // Test tool tracking storage
    const testToolTracking = {
      projectName: "storage_test_toolmanager",
      toolName: "Test Tool",
      quantity: 5,
      location: "Shelf A-01",
      timestamp: new Date().toISOString(),
    };

    await dataManager.saveToolTracking(testToolTracking);
    console.log("✅ Tool tracking saved successfully");

    // Test scan results storage
    const testScanResult = {
      scanPath: "/test/path",
      excelFileCount: 1,
      timestamp: new Date().toISOString(),
    };

    await dataManager.saveScanResult(testScanResult);
    console.log("✅ Scan result saved successfully");

    console.log("\n🎉 All storage tests passed!");
  } catch (error) {
    console.error("❌ Storage test failed:", error.message);
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
