// debug.js - Debugging and log viewing utilities for ToolManager
const fs = require("fs");
const path = require("path");
const Logger = require("./utils/Logger");
const config = require("./config");

function showLogFiles() {
  const logsDir = config.getPath("logs");

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
  const logsDir = config.getPath("logs");
  const logFiles = fs
    .readdirSync(logsDir)
    .filter((file) => file.endsWith(".log"))
    .sort();

  if (logFiles.length === 0) {
    console.log("📝 No log files found.");
    return;
  }

  const latestLogFile = path.join(logsDir, logFiles[logFiles.length - 1]);

  if (!fs.existsSync(latestLogFile)) {
    console.log("📝 No recent log file found.");
    return;
  }

  const content = fs.readFileSync(latestLogFile, "utf8");
  const allLines = content.split("\n").filter((line) => line.trim());
  const recentLines = allLines.slice(-lines);

  console.log(
    `📝 Last ${recentLines.length} log entries from ${path.basename(
      latestLogFile
    )}:`
  );
  console.log("═".repeat(80));
  recentLines.forEach((line) => console.log(line));
}

function showProcessingStatus() {
  const workTrackingDir = config.getPath("workTracking");
  const registryFile = path.join(
    workTrackingDir,
    "processed_files_registry.json"
  );

  console.log("📊 Processing Status:");
  console.log("═".repeat(50));

  // Check registry
  if (fs.existsSync(registryFile)) {
    const registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
    const entries = Object.values(registry);

    console.log(`📝 Processed files in registry: ${entries.length}`);

    if (entries.length > 0) {
      const successful = entries.filter((e) => e.success).length;
      const failed = entries.length - successful;
      const recent = entries.filter((e) => {
        const processedAt = new Date(e.processedAt);
        const hoursSince =
          (Date.now() - processedAt.getTime()) / (1000 * 60 * 60);
        return hoursSince < 24;
      });

      console.log(`✅ Successful: ${successful}`);
      console.log(`❌ Failed: ${failed}`);
      console.log(`🕐 Recent (24h): ${recent.length}`);

      if (recent.length > 0) {
        console.log("\n📋 Recent files:");
        recent.slice(-5).forEach((entry) => {
          const status = entry.success ? "✅" : "❌";
          const time = new Date(entry.processedAt).toLocaleString();
          console.log(
            `  ${status} ${entry.fileName} (${entry.toolCount} tools) - ${time}`
          );
        });
      }
    }
  } else {
    console.log("📝 No processing registry found");
  }

  // Check folder contents
  const filesToProcess = config.getPath("filesToProcess");
  const filesProcessed = config.getPath("filesProcessed");

  if (fs.existsSync(filesToProcess)) {
    const pendingFiles = fs
      .readdirSync(filesToProcess)
      .filter((f) => config.isExcelFile(f));
    console.log(`📁 Files waiting to process: ${pendingFiles.length}`);
    if (pendingFiles.length > 0) {
      pendingFiles.slice(0, 5).forEach((file) => console.log(`  📄 ${file}`));
      if (pendingFiles.length > 5)
        console.log(`  ... and ${pendingFiles.length - 5} more`);
    }
  }

  if (fs.existsSync(filesProcessed)) {
    const processedFiles = fs
      .readdirSync(filesProcessed)
      .filter((f) => config.isExcelFile(f));
    console.log(`📦 Files in archive: ${processedFiles.length}`);
  }
}

function showConfiguration() {
  console.log("⚙️  ToolManager Configuration:");
  console.log("═".repeat(50));
  console.log(`📱 App: ${config.app.name} v${config.app.version}`);
  console.log(`🌍 Environment: ${config.app.environment}`);
  console.log(`🧪 Test Mode: ${config.app.testMode ? "ON" : "OFF"}`);
  console.log(`📊 Log Level: ${config.app.logLevel}`);
  console.log("");
  console.log("🔄 Processing Modes:");
  console.log(`  Auto Mode: ${config.processing.autoMode ? "ON" : "OFF"}`);
  console.log(`  Email Mode: ${config.processing.emailMode ? "ON" : "OFF"}`);
  console.log(
    `  Scheduled Mode: ${config.processing.scheduledMode ? "ON" : "OFF"}`
  );
  console.log("");
  console.log("📁 Current Paths:");
  const paths = config.getAllPaths();
  Object.entries(paths).forEach(([key, value]) => {
    if (typeof value === "string") {
      const exists = fs.existsSync(value) ? "✅" : "❌";
      console.log(`  ${key}: ${exists} ${value}`);
    }
  });
}

function clearLogs() {
  const logsDir = config.getPath("logs");

  if (!fs.existsSync(logsDir)) {
    console.log("📁 No logs directory found.");
    return;
  }

  const logFiles = fs
    .readdirSync(logsDir)
    .filter((file) => file.endsWith(".log"));

  logFiles.forEach((file) => {
    fs.unlinkSync(path.join(logsDir, file));
  });

  console.log(`🗑️  Cleared ${logFiles.length} log files.`);
}

function clearProcessingData() {
  console.log("🧹 Clearing processing data...");

  const workTrackingDir = config.getPath("workTracking");
  const registryFile = path.join(
    workTrackingDir,
    "processed_files_registry.json"
  );

  if (fs.existsSync(registryFile)) {
    fs.unlinkSync(registryFile);
    console.log("🗑️  Cleared processing registry");
  }

  // Clear processed JSON files
  if (fs.existsSync(workTrackingDir)) {
    const jsonFiles = fs
      .readdirSync(workTrackingDir)
      .filter(
        (f) => f.endsWith(".json") && f !== "processed_files_registry.json"
      );
    jsonFiles.forEach((file) => {
      fs.unlinkSync(path.join(workTrackingDir, file));
    });
    console.log(`🗑️  Cleared ${jsonFiles.length} processing result files`);
  }

  console.log("✅ Processing data cleared");
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case "list":
    showLogFiles();
    break;
  case "tail":
    const lines = parseInt(process.argv[3]) || 50;
    showLatestLogs(lines);
    break;
  case "status":
    showProcessingStatus();
    break;
  case "config":
    showConfiguration();
    break;
  case "clear":
    clearLogs();
    break;
  case "reset":
    clearProcessingData();
    break;
  case "path":
    console.log("📁 Configuration paths:");
    const paths = config.getAllPaths();
    Object.entries(paths).forEach(([key, value]) => {
      if (typeof value === "string") {
        console.log(`  ${key}: ${value}`);
      }
    });
    break;
  default:
    console.log("🔍 Debug Utilities for ToolManager");
    console.log("");
    console.log("Usage:");
    console.log("  node debug.js list           - Show all log files");
    console.log(
      "  node debug.js tail [lines]   - Show recent log entries (default: 50)"
    );
    console.log(
      "  node debug.js status         - Show processing status and file counts"
    );
    console.log("  node debug.js config         - Show current configuration");
    console.log("  node debug.js clear          - Clear all log files");
    console.log(
      "  node debug.js reset          - Clear processing data and registry"
    );
    console.log("  node debug.js path           - Show all configured paths");
    console.log("");
    console.log("Examples:");
    console.log("  node debug.js tail 100       - Show last 100 log entries");
    console.log(
      "  node debug.js status         - Check what files are processed/pending"
    );
    console.log(
      "  node debug.js config         - View current configuration settings"
    );
}
