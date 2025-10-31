﻿// config.js
const path = require("path");

const config = {
  app: {
    testMode: true,
    autoMode: true, // Same as json_scanner's autorun
    scanIntervalMs: 60000, // 60 seconds - same as json_scanner
    logLevel: "info",
    enableDetailedLogging: true,
  },
  storage: {
    type: process.env.STORAGE_TYPE || "auto", // 'auto', 'local', 'mongodb'
    retentionPolicy: {
      backupDays: null, // No auto cleanup for ToolManager
      cleanupOldData: false, // Don't auto-delete tool data
    },
  },
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    database: process.env.MONGODB_DATABASE || "cnc_tools", // ToolManager database
    options: {
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    },
  },
  processing: {
    preventReprocessing: true,
    moveAfterProcessing: true,
    generateReports: true,
  },
  scheduling: {
    // Mode for determining job completion dates
    // Options: "estimated", "json_embedded", "schedule_file"
    completionDateMode: "estimated",

    // Days to add to creation date when using "estimated" mode
    estimatedCompletionDays: 5,

    // Fallback to estimated mode if other modes fail
    fallbackToEstimated: true,
  },
  files: {
    jsonExtension: ".json",
    fixedSuffix: "BRK_fixed",
    resultSuffix: "BRK_result",
  },
  paths: {
    test: {
      // Read-only test case folders (DO NOT MODIFY)
      testDataPath: path.join(__dirname, "test_data"),

      // Sample Excel files for development - to identify monitored tools
      sampleExcelPath: path.join(__dirname, "test_data", "testExcel"),

      // Working directories for actual processing during testing
      filesToProcess: path.join(__dirname, "working_data", "filesToProcess"),
      filesProcessed: path.join(
        __dirname,
        "working_data",
        "filesProcessedArchive"
      ),
      workTracking: path.join(
        __dirname,
        "working_data",
        "data",
        "workTracking"
      ),
      archive: path.join(__dirname, "working_data", "data", "archive"),
      analysis: path.join(__dirname, "working_data", "analysis"),

      // JSON files from CNC machines (same as json_scanner - read-only)
      jsonScanPath: path.join(
        __dirname,
        "..",
        "json_scanner",
        "test_data",
        "testPathHumming_auto"
      ),

      // Excel files directory (scan for any Excel files here in test mode)
      excelScanPath: path.join(__dirname, "test_data", "testExcel"),

      // Configuration files (schedule file can be in test_data if needed)
      scheduleFile: path.join(
        __dirname,
        "test_data",
        "schedules",
        "production_schedule.json"
      ),
    },
    production: {
      // Production Excel file processing directory
      filesToProcess: "C:\\Production\\EmailAttachments",
      filesProcessed: "C:\\Production\\ProcessedFiles",
      workTracking: "C:\\Production\\WorkTracking",
      archive: "C:\\Production\\Archive",
      analysis: "C:\\Production\\Analysis",

      // Excel files directory (scan for Excel files in production)
      excelScanPath: "C:\\Production\\Matrix",

      // JSON files from CNC machines (production path - root of JSON nest)
      jsonScanPath: "C:\\Production\\CNC_Data",
      scheduleFile: "C:\\Production\\Schedules\\production_schedule.json",
    },
  },
};

config.getScanPath = function () {
  // Returns JSON scan path since that's what we actually scan for data
  return this.getJsonScanPath();
};

config.getExcelScanPath = function () {
  return this.app.testMode
    ? this.paths.test.excelScanPath
    : this.paths.production.excelScanPath;
};

config.getSampleExcelPath = function () {
  // Only available in test mode - for development reference
  return this.app.testMode ? this.paths.test.sampleExcelPath : null;
};

config.getJsonScanPath = function () {
  return this.app.testMode
    ? this.paths.test.jsonScanPath
    : this.paths.production.jsonScanPath;
};

config.getScheduleFilePath = function () {
  return this.app.testMode
    ? this.paths.test.scheduleFile
    : this.paths.production.scheduleFile;
};

config.getCompletionDate = function (creationDate, projectData = null) {
  const createdDate = new Date(creationDate);

  switch (this.scheduling.completionDateMode) {
    case "json_embedded":
      // Try to extract completion date from JSON data
      if (projectData && projectData.completionDate) {
        return new Date(projectData.completionDate);
      }
      // Fall through to fallback if enabled
      if (this.scheduling.fallbackToEstimated) {
        return this.calculateEstimatedDate(createdDate);
      }
      return null;

    case "schedule_file":
      // Try to get date from external schedule file
      const scheduledDate = this.getScheduledDate(projectData);
      if (scheduledDate) {
        return scheduledDate;
      }
      // Fall through to fallback if enabled
      if (this.scheduling.fallbackToEstimated) {
        return this.calculateEstimatedDate(createdDate);
      }
      return null;

    case "estimated":
    default:
      return this.calculateEstimatedDate(createdDate);
  }
};

config.calculateEstimatedDate = function (creationDate) {
  const estimatedDate = new Date(creationDate);
  estimatedDate.setDate(
    estimatedDate.getDate() + this.scheduling.estimatedCompletionDays
  );
  return estimatedDate;
};

config.getScheduledDate = function (projectData) {
  // TODO: Implement schedule file reading logic
  // This would read from the schedule file and match project data
  // For now, return null to fall back to estimated mode
  return null;
};

config.initialize = function () {
  console.log("✓ ToolManager configuration initialized");
  console.log(
    `✓ Mode: ${this.app.testMode ? "TEST" : "PRODUCTION"} - ${
      this.app.autoMode ? "AUTO" : "MANUAL"
    }`
  );
  console.log(`✓ Scan interval: ${this.app.scanIntervalMs / 1000} seconds`);
  console.log(`✓ JSON scan path: ${this.getJsonScanPath()}`);
  console.log(`✓ Excel scan path: ${this.getExcelScanPath()}`);
  if (this.app.testMode && this.getSampleExcelPath()) {
    console.log(`✓ Sample Excel path: ${this.getSampleExcelPath()}`);
  }
  console.log(`✓ Completion date mode: ${this.scheduling.completionDateMode}`);
  if (this.scheduling.completionDateMode === "estimated") {
    console.log(
      `✓ Estimated completion days: ${this.scheduling.estimatedCompletionDays}`
    );
  }

  // Note about test mode
  if (this.app.testMode) {
    console.log(
      "📁 Reading JSON from json_scanner test data, Matrix Excel from test_data/"
    );
  }
};

module.exports = config;
