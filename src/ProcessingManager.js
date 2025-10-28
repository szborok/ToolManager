// src/ProcessingManager.js
/**
 * Excel Processing Mode Manager
 * Handles different Excel file processing scenarios
 */
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar"); // We'll need to add this dependency
const Config = require("../utils/Config");
const Logger = require("../utils/Logger");
const ExcelProcessor = require("./ExcelProcessor");

class ProcessingManager {
  constructor() {
    this.isWatching = false;
    this.emailWatcher = null;
    this.folderWatcher = null;
    this.manualQueue = [];
  }

  /**
   * OPTION 1: Email Attachment Processing (Future)
   * Automatically process Excel files from email attachments
   */
  async startEmailProcessing(emailConfig = {}) {
    Logger.info("Starting email attachment processing mode...");

    // This would integrate with email service (IMAP/Exchange)
    // For now, we'll create the framework
    const emailSettings = {
      server: emailConfig.server || Config.get("email.server"),
      username: emailConfig.username || Config.get("email.username"),
      password: emailConfig.password || Config.get("email.password"),
      attachmentPattern:
        emailConfig.pattern ||
        Config.get("email.attachment.pattern", ".*Matrix.*\\.xlsx$"),
      checkInterval:
        emailConfig.interval || Config.get("email.check.interval", 300000), // 5 minutes
      enabled: Config.get("email.enabled", false),
    };

    if (!emailSettings.enabled) {
      Logger.warn("Email processing is disabled in configuration");
      return { success: false, reason: "Email processing disabled" };
    }

    // TODO: Implement email connection and attachment monitoring
    Logger.info("Email processing framework ready (implementation pending)");
    return { success: true, mode: "email", status: "framework_ready" };
  }

  /**
   * OPTION 2: Folder Monitoring (Hot Folder)
   * Watch specific folder for new Excel files and process automatically
   */
  async startFolderWatching(watchPaths = null) {
    if (this.isWatching) {
      Logger.warn("Folder watching is already active");
      return { success: false, reason: "Already watching" };
    }

    const pathsToWatch =
      watchPaths ||
      [
        Config.getFolderPath("files.to.process.folder"),
        // Could add multiple paths for different sources
        Config.get("processing.additional.watch.folders", "")
          .split(",")
          .filter((p) => p.trim()),
      ]
        .flat()
        .filter((p) => p && p.trim());

    Logger.info(
      `Starting folder watching for paths: ${pathsToWatch.join(", ")}`
    );

    try {
      // Use chokidar for robust file watching
      this.folderWatcher = chokidar.watch(pathsToWatch, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true, // Don't process existing files on startup
        awaitWriteFinish: {
          stabilityThreshold: 2000, // Wait 2s for file to stabilize
          pollInterval: 100,
        },
      });

      this.folderWatcher
        .on("add", (filePath) => this.handleNewFile(filePath, "folder_watch"))
        .on("change", (filePath) =>
          this.handleFileChange(filePath, "folder_watch")
        )
        .on("error", (error) =>
          Logger.error(`Folder watcher error: ${error.message}`)
        );

      this.isWatching = true;
      Logger.info("Folder watching started successfully");

      return {
        success: true,
        mode: "folder_watch",
        watching: pathsToWatch,
        status: "active",
      };
    } catch (error) {
      Logger.error(`Failed to start folder watching: ${error.message}`);
      return { success: false, reason: error.message };
    }
  }

  /**
   * OPTION 3: Manual File Processing
   * Process specific Excel file on-demand with full path specification
   */
  async processManualFile(filePath, options = {}) {
    Logger.info(`Manual processing requested for: ${filePath}`);

    try {
      // Validate file
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      if (!this.isExcelFile(filePath)) {
        throw new Error(`File is not an Excel file: ${filePath}`);
      }

      // Add processing options
      const processingOptions = {
        source: "manual",
        priority: options.priority || "normal",
        processedBy: options.user || "system",
        timestamp: new Date().toISOString(),
        moveAfterProcessing: options.moveAfterProcessing !== false, // Default true
        destinationFolder:
          options.destinationFolder ||
          Config.getFolderPath("files.processed.folder"),
        generateReport: options.generateReport !== false, // Default true
        ...options,
      };

      // Process the file
      const result = await this.processExcelFile(filePath, processingOptions);

      Logger.info(`Manual processing completed for: ${filePath}`);
      return result;
    } catch (error) {
      Logger.error(
        `Manual processing failed for ${filePath}: ${error.message}`
      );
      return {
        success: false,
        error: error.message,
        file: filePath,
        mode: "manual",
      };
    }
  }

  /**
   * OPTION 4: Batch Processing
   * Process multiple Excel files from a folder or file list
   */
  async processBatch(source, options = {}) {
    Logger.info(`Starting batch processing from: ${source}`);

    let filesToProcess = [];

    try {
      if (Array.isArray(source)) {
        // Source is array of file paths
        filesToProcess = source.filter(
          (f) => this.isExcelFile(f) && fs.existsSync(f)
        );
      } else if (
        typeof source === "string" &&
        fs.statSync(source).isDirectory()
      ) {
        // Source is directory path
        const files = fs.readdirSync(source);
        filesToProcess = files
          .filter((f) => this.isExcelFile(f))
          .map((f) => path.join(source, f))
          .filter((f) => fs.existsSync(f));
      } else {
        throw new Error("Source must be array of files or directory path");
      }

      if (filesToProcess.length === 0) {
        Logger.warn("No Excel files found for batch processing");
        return { success: true, processed: 0, results: [] };
      }

      Logger.info(
        `Found ${filesToProcess.length} Excel files for batch processing`
      );

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Process files sequentially or in parallel based on options
      if (options.parallel && options.maxConcurrent) {
        // Parallel processing with concurrency limit
        results.push(
          ...(await this.processFilesInParallel(filesToProcess, options))
        );
      } else {
        // Sequential processing (safer for large files)
        for (const filePath of filesToProcess) {
          const result = await this.processExcelFile(filePath, {
            source: "batch",
            batchId: options.batchId || `batch_${Date.now()}`,
            ...options,
          });

          results.push(result);
          if (result.success) successCount++;
          else errorCount++;

          // Optional delay between files
          if (options.delayBetweenFiles) {
            await this.delay(options.delayBetweenFiles);
          }
        }
      }

      Logger.info(
        `Batch processing completed: ${successCount} successful, ${errorCount} failed`
      );

      return {
        success: true,
        mode: "batch",
        totalFiles: filesToProcess.length,
        successful: successCount,
        failed: errorCount,
        results: results,
      };
    } catch (error) {
      Logger.error(`Batch processing failed: ${error.message}`);
      return { success: false, error: error.message, mode: "batch" };
    }
  }

  /**
   * OPTION 5: Scheduled Processing
   * Process files on schedule (daily, hourly, custom intervals)
   */
  async startScheduledProcessing(schedule = {}) {
    const scheduleConfig = {
      enabled: schedule.enabled || Config.get("scheduling.enabled", false),
      interval: schedule.interval || Config.get("scheduling.interval", "daily"),
      time: schedule.time || Config.get("scheduling.time", "06:00"),
      folder:
        schedule.folder || Config.getFolderPath("files.to.process.folder"),
      autoArchive: schedule.autoArchive !== false,
      ...schedule,
    };

    if (!scheduleConfig.enabled) {
      Logger.warn("Scheduled processing is disabled");
      return { success: false, reason: "Scheduling disabled" };
    }

    Logger.info(
      `Starting scheduled processing: ${scheduleConfig.interval} at ${scheduleConfig.time}`
    );

    // Implementation would use node-cron or similar
    // For now, we'll create the framework

    return {
      success: true,
      mode: "scheduled",
      schedule: scheduleConfig,
      status: "framework_ready",
    };
  }

  /**
   * Handle new file detected by folder watcher
   */
  async handleNewFile(filePath, source) {
    Logger.info(`New file detected: ${filePath} (source: ${source})`);

    if (!this.isExcelFile(filePath)) {
      Logger.debug(`Ignoring non-Excel file: ${filePath}`);
      return;
    }

    // Check if file has already been processed (avoid reprocessing)
    if (await this.isFileAlreadyProcessed(filePath)) {
      Logger.info(`File already processed, skipping: ${filePath}`);
      return;
    }

    // Process the file automatically with auto-move enabled
    const result = await this.processExcelFile(filePath, {
      source: source,
      autoDetected: true,
      processedAt: new Date().toISOString(),
      moveAfterProcessing: Config.get("auto.processing.move.after", true), // Auto-move to prevent reprocessing
      destinationFolder: Config.getFolderPath("files.processed.folder"),
      generateReport: Config.get("auto.processing.generate.report", true),
      priority: "auto",
    });

    if (result.success) {
      Logger.info(
        `Auto-processed file successfully: ${filePath} → moved to archive`
      );
    } else {
      Logger.error(`Auto-processing failed for: ${filePath} - ${result.error}`);
      // Move failed files to error folder to prevent endless reprocessing
      await this.moveFileToErrorFolder(filePath);
    }
  }

  /**
   * Handle file change detected by folder watcher
   */
  async handleFileChange(filePath, source) {
    Logger.debug(`File changed: ${filePath} (source: ${source})`);
    // Could implement re-processing logic if needed
  }

  /**
   * Core Excel file processing method
   */
  async processExcelFile(filePath, options = {}) {
    try {
      Logger.info(`Processing Excel file: ${filePath}`);

      // Get file stats before processing (in case file gets moved)
      const fileStats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      const fileSize = fileStats.size;
      const modifiedTime = fileStats.mtime.getTime();

      // Use ExcelProcessor to handle the file
      const result = ExcelProcessor.processMainExcel(filePath);

      if (result.success) {
        // Save processed result
        const outputPath = this.generateOutputPath(filePath, options);
        ExcelProcessor.saveInventoryToJson(result, outputPath);

        // Move original file if requested
        if (options.moveAfterProcessing !== false) {
          // Default to true
          const destinationFolder =
            options.destinationFolder ||
            Config.getFolderPath("files.processed.folder");
          await this.moveProcessedFile(filePath, destinationFolder);
        }

        // Generate additional outputs if requested
        if (options.generateReport) {
          await this.generateProcessingReport(result, options);
        }

        const finalResult = {
          success: true,
          sourceFile: filePath,
          outputFile: outputPath,
          toolCount: Object.keys(result.toolInventory || {}).length,
          processedAt: result.processedAt,
          options: options,
        };

        // Register file as processed to prevent reprocessing (use pre-move stats)
        await this.registerFileAsProcessedWithStats(
          filePath,
          finalResult,
          fileName,
          fileSize,
          modifiedTime
        );

        return finalResult;
      } else {
        return result;
      }
    } catch (error) {
      Logger.error(`Excel processing error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        sourceFile: filePath,
        options: options,
      };
    }
  }

  /**
   * Check if file is Excel format
   */
  isExcelFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return [".xlsx", ".xls"].includes(ext);
  }

  /**
   * Check if file has already been processed to avoid reprocessing
   */
  async isFileAlreadyProcessed(filePath) {
    try {
      const fileName = path.basename(filePath);
      const fileStats = fs.statSync(filePath);
      const fileSize = fileStats.size;
      const modifiedTime = fileStats.mtime.getTime();

      // Create unique file signature
      const fileSignature = `${fileName}_${fileSize}_${modifiedTime}`;

      // Check processed files registry
      const processedRegistryPath = path.join(
        Config.getFolderPath("work.tracking.folder"),
        "processed_files_registry.json"
      );

      if (fs.existsSync(processedRegistryPath)) {
        const registry = JSON.parse(
          fs.readFileSync(processedRegistryPath, "utf8")
        );

        // Check if this file signature exists and was processed recently (within 24h)
        if (registry[fileSignature]) {
          const processedAt = new Date(registry[fileSignature].processedAt);
          const hoursSinceProcessed =
            (Date.now() - processedAt.getTime()) / (1000 * 60 * 60);

          if (hoursSinceProcessed < 24) {
            Logger.debug(
              `File already processed ${hoursSinceProcessed.toFixed(
                1
              )}h ago: ${fileName}`
            );
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      Logger.warn(`Could not check processed file registry: ${error.message}`);
      return false;
    }
  }

  /**
   * Register file as processed to prevent reprocessing
   */
  async registerFileAsProcessed(filePath, result) {
    try {
      const fileName = path.basename(filePath);
      const fileStats = fs.statSync(filePath);
      const fileSize = fileStats.size;
      const modifiedTime = fileStats.mtime.getTime();

      await this.registerFileAsProcessedWithStats(
        filePath,
        result,
        fileName,
        fileSize,
        modifiedTime
      );
    } catch (error) {
      Logger.warn(`Could not register processed file: ${error.message}`);
    }
  }

  /**
   * Register file as processed using provided stats (for cases where file was already moved)
   */
  async registerFileAsProcessedWithStats(
    filePath,
    result,
    fileName,
    fileSize,
    modifiedTime
  ) {
    try {
      const fileSignature = `${fileName}_${fileSize}_${modifiedTime}`;

      const processedRegistryPath = path.join(
        Config.getFolderPath("work.tracking.folder"),
        "processed_files_registry.json"
      );

      // Load existing registry or create new
      let registry = {};
      if (fs.existsSync(processedRegistryPath)) {
        registry = JSON.parse(fs.readFileSync(processedRegistryPath, "utf8"));
      }

      // Add file to registry
      registry[fileSignature] = {
        fileName: fileName,
        filePath: filePath,
        fileSize: fileSize,
        modifiedTime: modifiedTime,
        processedAt: new Date().toISOString(),
        success: result.success,
        toolCount: result.toolCount || 0,
        outputFile: result.outputFile,
      };

      // Clean old entries (older than 30 days)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      Object.keys(registry).forEach((key) => {
        const entry = registry[key];
        if (new Date(entry.processedAt).getTime() < thirtyDaysAgo) {
          delete registry[key];
        }
      });

      // Ensure directory exists
      const registryDir = path.dirname(processedRegistryPath);
      if (!fs.existsSync(registryDir)) {
        fs.mkdirSync(registryDir, { recursive: true });
      }

      // Save registry
      fs.writeFileSync(
        processedRegistryPath,
        JSON.stringify(registry, null, 2)
      );
      Logger.debug(`Registered processed file: ${fileName}`);
    } catch (error) {
      Logger.warn(`Could not register processed file: ${error.message}`);
    }
  }

  /**
   * Move failed files to error folder to prevent endless reprocessing
   */
  async moveFileToErrorFolder(filePath) {
    try {
      const errorFolder = path.join(
        Config.getFolderPath("files.processed.folder"),
        "errors"
      );

      // Ensure error folder exists
      if (!fs.existsSync(errorFolder)) {
        fs.mkdirSync(errorFolder, { recursive: true });
      }

      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const errorFileName = `ERROR_${timestamp}_${fileName}`;
      const errorFilePath = path.join(errorFolder, errorFileName);

      fs.renameSync(filePath, errorFilePath);
      Logger.warn(`Moved failed file to error folder: ${errorFilePath}`);
    } catch (error) {
      Logger.error(`Could not move file to error folder: ${error.message}`);
    }
  }

  /**
   * Generate output file path for processed results
   */
  generateOutputPath(inputFilePath, options) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const baseName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputDir = Config.getFolderPath("work.tracking.folder");

    return path.join(outputDir, `${baseName}_processed_${timestamp}.json`);
  }

  /**
   * Move processed file to archive folder
   */
  async moveProcessedFile(filePath, destinationFolder) {
    try {
      const fileName = path.basename(filePath);
      const destinationPath = path.join(destinationFolder, fileName);

      // Ensure destination directory exists
      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
      }

      // Move file
      fs.renameSync(filePath, destinationPath);
      Logger.info(`Moved processed file to: ${destinationPath}`);
    } catch (error) {
      Logger.error(`Failed to move file ${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate processing report
   */
  async generateProcessingReport(processResult, options) {
    // Implementation for generating detailed processing reports
    Logger.info("Processing report generation requested");
  }

  /**
   * Process files in parallel with concurrency control
   */
  async processFilesInParallel(files, options) {
    const maxConcurrent = options.maxConcurrent || 3;
    const results = [];

    // Implementation would use Promise pools or similar
    Logger.info(
      `Parallel processing not yet implemented, falling back to sequential`
    );

    for (const file of files) {
      const result = await this.processExcelFile(file, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Stop all watching and scheduled processing
   */
  async stopProcessing() {
    Logger.info("Stopping all processing modes...");

    if (this.folderWatcher) {
      await this.folderWatcher.close();
      this.folderWatcher = null;
    }

    if (this.emailWatcher) {
      // Stop email watcher when implemented
      this.emailWatcher = null;
    }

    this.isWatching = false;
    Logger.info("All processing modes stopped");
  }

  /**
   * Get current processing status
   */
  getStatus() {
    return {
      folderWatching: this.isWatching,
      emailProcessing: false, // TODO: implement
      scheduledProcessing: false, // TODO: implement
      manualQueueLength: this.manualQueue.length,
    };
  }
}

module.exports = ProcessingManager;
