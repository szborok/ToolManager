// path: src/Scanner.js
/**
 * Handles automatic or manual scanning of Excel files (tool inventory) 
 * and JSON files (tool usage data - same logic as json_scanner).
 */

const fs = require("fs");
const path = require("path");
const config = require("../config");
const Logger = require("../utils/Logger");
const { getDirectories } = require("../utils/FileUtils");
const Project = require("./Project");

class Scanner {
  constructor() {
    this.projects = [];
    this.running = false;
  }

  /**
   * Start the scanner.
   * In AUTO mode, the Executor will control scanning.
   * In MANUAL mode, this enables manual scanning capability.
   */
  start() {
    this.running = true;
    Logger.info(`Scanner started in ${config.app.autoMode ? "AUTO" : "MANUAL"} mode`);
  }

  /**
   * Stop scanning after the current cycle.
   */
  stop() {
    this.running = false;
    Logger.warn("Scanner stopped after finishing current project.");
  }

  /**
   * Perform one scan for JSON projects (same structure as json_scanner).
   * Each project folder contains positions with JSON files for tool usage analysis.
   * @param {string} customPath - Custom path for manual mode (optional)
   */
  /**
   * Performs a single scan iteration following the defined workflow:
   * 1. Process ONE Excel file and save results
   * 2. Find ALL JSON files
   * 3. Copy ALL JSON files to temp folder
   * 4. Fix/sanitize ALL JSON files
   * 5. Process ALL sanitized JSON files
   * 6. Generate consolidated report
   * 7. Clean temp folder
   * @param {string} customPath - Custom path for manual mode (optional)
   */
  async performScan(customPath = null) {
    try {
      // Get the JSON scan path (this is what we actually scan)
      const jsonScanPath = customPath || config.getJsonScanPath();
      
      if (!jsonScanPath) {
        Logger.error("No JSON scan path available.");
        return [];
      }

      Logger.info(`🔍 Scanning for tool usage analysis: ${jsonScanPath}`);
      
      // Step 1 & 2: Find and process ONE Excel file, save results
      const excelData = await this.processExcelFile();
      
      // Step 3: Find ALL JSON files for tool usage analysis
      const allJsonFiles = this.findAllJsonFiles(jsonScanPath);
      Logger.info(`🔍 Found ${allJsonFiles.length} JSON file(s) for tool usage analysis.`);
      
      if (allJsonFiles.length === 0) {
        Logger.info(`📭 No JSON files found in this scan`);
        return [];
      }
      
      // Step 4: Copy ALL JSON files to temp folder
      const tempJsonFiles = await this.copyJsonFilesToTemp(allJsonFiles);
      Logger.info(`📁 Copied ${tempJsonFiles.length} JSON file(s) to temp folder`);
      
      // Step 5: Fix/sanitize ALL JSON files in temp folder
      const sanitizedFiles = await this.sanitizeAllJsonFiles(tempJsonFiles);
      Logger.info(`🔧 Sanitized ${sanitizedFiles.length} JSON file(s)`);
      
      // Step 6: Process ALL sanitized JSON files
      const processedData = await this.processAllJsonFiles(sanitizedFiles);
      Logger.info(`📊 Processed ${processedData.length} JSON file(s) for tool usage data`);
      
      // Step 7: Generate consolidated report
      await this.generateConsolidatedReport(excelData, processedData);
      Logger.info(`📄 Generated consolidated report`);
      
      // Step 8: Clean temp folder
      await this.cleanTempFolder();
      Logger.info(`🧹 Cleaned temp folder`);
      
      Logger.info(`Successfully processed ${allJsonFiles.length} JSON file(s) for tool usage analysis.`);
      return processedData;
      
    } catch (err) {
      Logger.error(`Scanner failed: ${err.message}`);
      // Always clean temp folder even on error
      try {
        await this.cleanTempFolder();
      } catch (cleanupErr) {
        Logger.error(`Failed to cleanup temp folder: ${cleanupErr.message}`);
      }
      return [];
    }
  }

  /**
   * Group JSON files by their project folders (same logic as json_scanner)
   */
  groupJsonFilesByProject(allJsonFiles) {
    const projectFolders = new Map();

    for (const jsonFile of allJsonFiles) {
      // Use the project name from extractProjectInfoFromPath (already calculated correctly)
      const projectName = jsonFile.projectName; // This should be the project base (e.g., W5270NS01003)
      const machineFolder = jsonFile.directory; // Directory containing the JSON file (machine folder)
      const positionPath = path.dirname(machineFolder); // Position folder (e.g., W5270NS01001A)
      const projectPath = path.dirname(positionPath); // Project folder (e.g., W5270NS01001)

      if (!projectFolders.has(projectName)) {
        projectFolders.set(projectName, {
          name: projectName,
          path: projectPath,
          positions: [],
          jsonFiles: []
        });
      }

      const projectFolder = projectFolders.get(projectName);
      projectFolder.positions.push(jsonFile.positionName || path.basename(positionPath));
      projectFolder.jsonFiles.push(jsonFile);
    }

    return Array.from(projectFolders.values());
  }

  /**
   * Returns all discovered projects.
   */
  getProjects() {
    return this.projects;
  }

  /**
   * Recursively finds all JSON files in the given directory tree.
   * Same logic as json_scanner for tool usage data extraction.
   * @param {string} rootPath - Root directory to start searching
   * @returns {Array} - Array of JSON file objects with metadata
   */
  findAllJsonFiles(rootPath) {
    const jsonFiles = [];
    
    if (!fs.existsSync(rootPath)) {
      Logger.warn(`JSON scan path does not exist: ${rootPath}`);
      return jsonFiles;
    }
    
    const scanDirectory = (dirPath) => {
      try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (item.isDirectory()) {
            // Recursively scan subdirectories
            scanDirectory(fullPath);
          } else if (item.isFile() && item.name.endsWith('.json')) {
            // Skip generated files (BRK_fixed, BRK_result) - we only want original JSON
            if (item.name.includes('BRK_fixed') || item.name.includes('BRK_result')) {
              continue;
            }
            
            // Extract project information from filename and path
            const fileInfo = this.extractProjectInfoFromPath(fullPath, item.name);
            if (fileInfo) {
              jsonFiles.push(fileInfo);
            }
          }
        }
      } catch (err) {
        Logger.warn(`Cannot scan directory ${dirPath}: ${err.message}`);
      }
    };
    
    scanDirectory(rootPath);
    return jsonFiles;
  }

  /**
   * Extracts project information from JSON file path and name.
   * Same logic as json_scanner for tool usage data extraction.
   * @param {string} fullPath - Full path to the JSON file
   * @param {string} fileName - Name of the JSON file
   * @returns {Object|null} - Project info object or null if not a valid project file
   */
  extractProjectInfoFromPath(fullPath, fileName) {
    // Match project pattern: W5270NS01003A.json
    const projectMatch = fileName.match(/^(W\d{4}[A-Z]{2}\d{2,})([A-Z]?)\.json$/);
    
    if (projectMatch) {
      const projectBase = projectMatch[1]; // W5270NS01003
      const position = projectMatch[2] || 'A'; // A, B, C, etc. (default to A if not specified)
      const positionName = projectBase + position; // W5270NS01003A
      
      return {
        fullPath: fullPath,
        fileName: fileName,
        projectBase: projectBase,
        projectName: projectBase, // Use project base for grouping, not position name
        positionName: positionName, // Full position name for reference
        position: position,
        directory: path.dirname(fullPath)
      };
    }
    
    return null;
  }

  /**
   * Recursively finds all Excel files in the given directory tree.
   * @param {string} rootPath - Root directory to start searching
   * @returns {Array} - Array of Excel file objects with metadata
   */
  findAllExcelFiles(rootPath) {
    const excelFiles = [];
    
    if (!fs.existsSync(rootPath)) {
      Logger.warn(`Excel scan path does not exist: ${rootPath}`);
      return excelFiles;
    }
    
    const searchDirectory = (dirPath) => {
      try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            // Recursively search subdirectories
            searchDirectory(fullPath);
          } else if (entry.isFile() && this.isExcelFile(entry.name)) {
            excelFiles.push({
              fullPath: fullPath,
              fileName: entry.name,
              directory: dirPath
            });
          }
        }
      } catch (err) {
        Logger.warn(`Cannot read directory ${dirPath}: ${err.message}`);
      }
    };
    
    searchDirectory(rootPath);
    return excelFiles;
  }

  /**
   * Check if a file is an Excel file based on extension.
   * @param {string} fileName - Name of the file
   * @returns {boolean} - True if file is Excel format
   */
  isExcelFile(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    return ['.xlsx', '.xls', '.xlsm'].includes(extension);
  }

  // ============ NEW WORKFLOW METHODS ============

  /**
   * Step 1 & 2: Find and process ONE Excel file, save results
   */
  async processExcelFile() {
    const excelScanPath = config.getExcelScanPath();
    const excelFiles = this.findAllExcelFiles(excelScanPath);
    
    if (excelFiles.length === 0) {
      Logger.warn(`📭 No Excel files found in: ${excelScanPath}`);
      return null;
    }
    
    // Process the first Excel file found
    const excelFile = excelFiles[0];
    Logger.info(`📊 Processing Excel file: ${excelFile.fileName}`);
    
    try {
      // Use ExcelProcessor to read actual Excel data
      const ExcelProcessor = require('./ExcelProcessor');
      
      const excelData = ExcelProcessor.processMainExcel(excelFile.fullPath);
      
      // Convert toolInventory object to array format for Results.js
      const toolInventoryArray = [];
      if (excelData.toolInventory) {
        for (const [toolCode, quantity] of Object.entries(excelData.toolInventory)) {
          toolInventoryArray.push({
            toolCode: toolCode,
            description: '', // ExcelProcessor doesn't extract descriptions yet
            quantity: quantity
          });
        }
      }
      
      const result = {
        fileName: excelFile.fileName,
        filePath: excelFile.fullPath,
        processedAt: new Date().toISOString(),
        toolInventory: toolInventoryArray
      };
      
      Logger.info(`💾 Saved Excel results: ${result.toolInventory.length} tools found`);
      return result;
      
    } catch (err) {
      Logger.error(`Failed to process Excel file ${excelFile.fileName}: ${err.message}`);
      
      // Return placeholder data on error
      const result = {
        fileName: excelFile.fileName,
        filePath: excelFile.fullPath,
        processedAt: new Date().toISOString(),
        toolInventory: [],
        error: err.message
      };
      
      return result;
    }
  }

  /**
   * Step 4: Copy ALL JSON files to temp folder
   */
  async copyJsonFilesToTemp(allJsonFiles) {
    const tempDir = path.join(__dirname, '..', 'temp');
    
    // Ensure temp directory exists and is clean
    if (fs.existsSync(tempDir)) {
      await this.cleanTempFolder();
    }
    fs.mkdirSync(tempDir, { recursive: true });
    
    const tempFiles = [];
    
    for (const jsonFile of allJsonFiles) {
      try {
        const originalFileName = path.basename(jsonFile.fullPath);
        const tempFilePath = path.join(tempDir, originalFileName);
        
        // Copy original file to temp
        fs.copyFileSync(jsonFile.fullPath, tempFilePath);
        
        tempFiles.push({
          originalPath: jsonFile.fullPath,
          tempPath: tempFilePath,
          fileName: originalFileName,
          projectInfo: jsonFile
        });
        
      } catch (err) {
        Logger.error(`Failed to copy ${jsonFile.fullPath} to temp: ${err.message}`);
      }
    }
    
    return tempFiles;
  }

  /**
   * Step 5: Fix/sanitize ALL JSON files in temp folder
   */
  async sanitizeAllJsonFiles(tempJsonFiles) {
    const sanitizedFiles = [];
    
    for (const tempFile of tempJsonFiles) {
      try {
        Logger.info(`🔧 Sanitizing: ${tempFile.fileName}`);
        
        // Read the temp file
        const rawContent = fs.readFileSync(tempFile.tempPath, 'utf8');
        
        // Sanitize the content (same logic as Project.sanitizeJsonContent)
        const sanitizedContent = this.sanitizeJsonContent(rawContent);
        
        // Write sanitized content back to temp file
        fs.writeFileSync(tempFile.tempPath, sanitizedContent, 'utf8');
        
        sanitizedFiles.push({
          ...tempFile,
          sanitized: true
        });
        
      } catch (err) {
        Logger.error(`Failed to sanitize ${tempFile.fileName}: ${err.message}`);
      }
    }
    
    return sanitizedFiles;
  }

  /**
   * Step 6: Process ALL sanitized JSON files
   */
  async processAllJsonFiles(sanitizedFiles) {
    const processedData = [];
    
    for (const file of sanitizedFiles) {
      try {
        Logger.info(`📊 Processing: ${file.fileName}`);
        
        // Read and parse the sanitized JSON
        const jsonContent = JSON.parse(fs.readFileSync(file.tempPath, 'utf8'));
        
        // Extract tool usage data
        const toolUsageData = this.extractToolUsageData(jsonContent, file.projectInfo);
        
        processedData.push({
          fileName: file.fileName,
          originalPath: file.originalPath,
          projectInfo: file.projectInfo,
          toolUsage: toolUsageData,
          processedAt: new Date().toISOString()
        });
        
      } catch (err) {
        Logger.error(`Failed to process ${file.fileName}: ${err.message}`);
      }
    }
    
    return processedData;
  }

  /**
   * Step 7: Generate consolidated report
   */
  async generateConsolidatedReport(excelData, processedJsonData) {
    const Results = require('./Results');
    const results = new Results();
    
    // Generate the consolidated report
    await results.generateConsolidatedReport(excelData, processedJsonData);
  }

  /**
   * Step 8: Clean temp folder
   */
  async cleanTempFolder() {
    const tempDir = path.join(__dirname, '..', 'temp');
    
    if (!fs.existsSync(tempDir)) {
      return;
    }
    
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
      Logger.info(`🧹 Cleaned ${files.length} file(s) from temp folder`);
    } catch (err) {
      Logger.warn(`Failed to clean temp folder: ${err.message}`);
    }
  }

  /**
   * Sanitize JSON content (same logic as Project.sanitizeJsonContent)
   */
  sanitizeJsonContent(jsonString) {
    // Fix unquoted NaN values which are invalid JSON
    let sanitized = jsonString.replace(/:\s*NaN\s*,/g, ': null,');
    sanitized = sanitized.replace(/:\s*NaN\s*}/g, ': null}');
    sanitized = sanitized.replace(/:\s*NaN\s*]/g, ': null]');
    
    // Fix infinity values if they exist
    sanitized = sanitized.replace(/:\s*Infinity\s*,/g, ': null,');
    sanitized = sanitized.replace(/:\s*Infinity\s*}/g, ': null}');
    sanitized = sanitized.replace(/:\s*-Infinity\s*,/g, ': null,');
    sanitized = sanitized.replace(/:\s*-Infinity\s*}/g, ': null}');
    
    return sanitized;
  }

  /**
   * Extract tool usage data from JSON content
   */
  extractToolUsageData(jsonContent, projectInfo) {
    const toolUsage = {
      project: projectInfo.projectName || 'UNKNOWN',
      position: projectInfo.positionName || 'UNKNOWN',
      machine: jsonContent.machine || 'UNKNOWN',
      operator: jsonContent.operator || 'UNKNOWN',
      operations: [],
      totalTime: 0,
      toolsUsed: new Set()
    };
    
    if (jsonContent.operations && Array.isArray(jsonContent.operations)) {
      for (const operation of jsonContent.operations) {
        const opData = {
          programName: operation.programName || 'UNKNOWN',
          toolName: operation.toolName || 'UNKNOWN',
          operationTime: operation.operationTime || 0,
          maxSpeed: operation.maxSpeed || 0,
          maxFeed: operation.maxFeed || 0
        };
        
        toolUsage.operations.push(opData);
        toolUsage.totalTime += opData.operationTime;
        if (opData.toolName !== 'UNKNOWN') {
          toolUsage.toolsUsed.add(opData.toolName);
        }
      }
    }
    
    // Convert Set to Array for JSON serialization
    toolUsage.toolsUsed = Array.from(toolUsage.toolsUsed);
    
    return toolUsage;
  }
}

module.exports = Scanner;
