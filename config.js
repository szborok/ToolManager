// config.js
/**
 * Unified application configuration for ToolManager.
 * Contains all settings, paths, and processing configurations.
 */

const path = require("path");

const config = {
  // Application settings
  app: {
    name: "ToolManager",
    version: "1.0.0",
    environment: "development", // development, production
    testMode: true, // true = use test data paths, false = use production paths
    logLevel: "info", // can be: 'debug', 'info', 'warn', 'error'
    enableDetailedLogging: true,
  },

  // Processing modes
  processing: {
    autoMode: true, // Enable automatic folder watching
    scheduledMode: false, // Enable scheduled processing
    emailMode: false, // Enable email processing
    fileWatcherDelayMs: 2000, // File stabilization delay
    preventReprocessing: true, // Use registry to prevent duplicate processing
    moveAfterProcessing: true, // Move processed files to archive
    generateReports: true, // Generate processing reports
  },

  // Paths configuration
  paths: {
    // Test mode paths (for development and testing)
    test: {
      baseDirectory: __dirname,
      filesToProcess: path.join(__dirname, "test_data", "filesToProcess"),
      filesProcessed: path.join(
        __dirname,
        "test_data",
        "filesProcessedArchive"
      ),
      workTracking: path.join(__dirname, "test_data", "data", "workTracking"),
      archive: path.join(__dirname, "test_data", "data", "archive"),
      sampleExcels: path.join(__dirname, "test_data", "sampleExcels"),
      logs: path.join(__dirname, "logs"),
      temp: path.join(__dirname, "temp"),
    },
    // Production mode paths (to be configured for live environment)
    production: {
      baseDirectory: "C:\\Production\\ToolManager",
      filesToProcess: "C:\\Production\\EmailAttachments",
      filesProcessed: "C:\\Production\\ProcessedFiles",
      workTracking: "C:\\Production\\WorkTracking",
      archive: "C:\\Production\\Archive",
      sampleExcels: "C:\\Production\\ToolReferences",
      logs: "C:\\Production\\Logs",
      temp: "C:\\Production\\Temp",
    },
    // Configuration files
    companyConfig: path.join(__dirname, "companyConfig", "config.properties"),
    toolDefinitions: path.join(
      __dirname,
      "companyConfig",
      "ToolDefinitions.txt"
    ),
    employees: path.join(__dirname, "companyConfig", "Employees.txt"),
  },

  // Excel processing settings
  excel: {
    skipHeaderRows: 1,
    skipEmptyRows: true,
    expectedColumns: [
      "tool_code",
      "tool_id",
      "diameter",
      "description",
      "quantity",
      "status",
      "location",
    ],
    requiredColumns: ["tool_code", "diameter"],
    attachmentPattern: ".*Matrix.*\\.xlsx$",
  },

  // Tool categories and settings
  tools: {
    categories: ["ECUT", "MFC", "XF", "XFEED"],
    defaultMaxLife: 60,
    defaultOverrunPercent: 10,
    identificationConfidenceThreshold: 0.7,
  },

  // File processing patterns
  files: {
    matrixOriginalPattern: "Euroform_Matrix_{date}.xlsx",
    matrixFixedPattern: "Euroform_Matrix_FIXED_{date}.xlsx",
    matrixJsonPattern: "Euroform_Matrix_JSON_{date}.json",
    workTrackingPattern: "{category}_{date}.json",
    excelExtensions: [".xlsx", ".xls"],
  },

  // Email processing (for future implementation)
  email: {
    enabled: false,
    server: null, // "imap.company.com"
    username: null, // "toolmanager@company.com"
    password: null,
    checkIntervalMs: 300000, // 5 minutes
    autoProcess: true,
    archiveProcessed: true,
  },

  // Scheduling configuration
  scheduling: {
    enabled: false,
    interval: "daily", // daily, hourly, custom
    time: "06:00",
    autoArchive: true,
    planningDaysAhead: 7,
    planningWindowStartHour: 6,
  },

  // Batch processing settings
  batch: {
    maxConcurrent: 3,
    delayBetweenFiles: 1000,
    parallelEnabled: false,
  },

  // Performance and monitoring
  performance: {
    logMaxFiles: 10,
    logMaxSize: "10MB",
    workTrackingEnabled: true,
    workTrackingAutoArchive: true,
    workTrackingIncludeMetadata: true,
    workTrackingPrettyFormat: true,
  },
};

/**
 * Helper function to get paths based on current mode
 * @param {string} pathKey - Key for the path (e.g., 'filesToProcess')
 * @returns {string} The appropriate path for current mode
 */
config.getPath = function (pathKey) {
  const mode = this.app.testMode ? "test" : "production";
  return this.paths[mode][pathKey] || this.paths.test[pathKey];
};

/**
 * Helper function to get all processing paths for current mode
 * @returns {Object} Object containing all paths for current mode
 */
config.getAllPaths = function () {
  const mode = this.app.testMode ? "test" : "production";
  return this.paths[mode];
};

/**
 * Helper function to check if a file is an Excel file
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file is Excel format
 */
config.isExcelFile = function (filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return this.files.excelExtensions.includes(ext);
};

/**
 * Helper function to get configuration for specific processing mode
 * @param {string} mode - Processing mode ('auto', 'manual', 'batch', 'email', 'scheduled')
 * @returns {Object} Configuration for the specified mode
 */
config.getProcessingConfig = function (mode) {
  const baseConfig = {
    moveAfterProcessing: this.processing.moveAfterProcessing,
    generateReports: this.processing.generateReports,
    preventReprocessing: this.processing.preventReprocessing,
  };

  switch (mode) {
    case "auto":
      return {
        ...baseConfig,
        moveAfterProcessing: true, // Always move in auto mode
        source: "folder_watch",
        priority: "auto",
      };
    case "manual":
      return {
        ...baseConfig,
        source: "manual",
        priority: "normal",
      };
    case "batch":
      return {
        ...baseConfig,
        source: "batch",
        maxConcurrent: this.batch.maxConcurrent,
        delayBetweenFiles: this.batch.delayBetweenFiles,
      };
    case "email":
      return {
        ...baseConfig,
        moveAfterProcessing: true, // Always move email attachments
        source: "email",
        priority: "high",
      };
    case "scheduled":
      return {
        ...baseConfig,
        moveAfterProcessing: true, // Always move in scheduled mode
        source: "scheduled",
        priority: "normal",
      };
    default:
      return baseConfig;
  }
};

/**
 * Initialize configuration and validate required paths
 */
config.initialize = function () {
  // Ensure required directories exist in test mode
  if (this.app.testMode) {
    const fs = require("fs");
    const testPaths = this.paths.test;

    Object.values(testPaths).forEach((dirPath) => {
      if (typeof dirPath === "string" && dirPath !== __dirname) {
        try {
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
        } catch (error) {
          console.warn(`Could not create directory: ${dirPath}`);
        }
      }
    });
  }

  console.log(
    `✓ ToolManager configuration initialized (${this.app.environment} mode)`
  );
};

module.exports = config;
