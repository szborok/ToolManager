// path: src/Analyzer.js
/**
 * The Analyzer is responsible for loading, validating, and processing Excel files
 * to identify tools and generate work tracking data.
 */

const fs = require("fs");
const path = require("path");
const config = require("../config");
const Logger = require("../utils/Logger");
const ExcelProcessor = require("./ExcelProcessor");
const ToolFactory = require("./ToolFactory");
const ToolLogic = require("./ToolLogic");

class Analyzer {
  constructor() {
    this.excelProcessor = ExcelProcessor; // Static class
    this.toolFactory = new ToolFactory();
    this.toolLogic = new ToolLogic();
  }

  /**
   * Process the Excel file in a given project.
   * @param {Project} project - The project to analyze.
   */
  analyzeProject(project) {
    Logger.info(`Analyzing project "${project.getFullName()}"...`);

    if (!project.excelFilePath) {
      Logger.warn(`No Excel file found for project "${project.getFullName()}"`);
      return project;
    }

    try {
      // Validate and extract data from Excel file
      const extractedData = this.validateAndExtractExcel(project.excelFilePath);

      if (extractedData) {
        // Store extracted data in project
        project.setExtractedData(extractedData);
        Logger.info(`✓ Excel data extracted: ${extractedData.tools ? extractedData.tools.length : 0} tools found`);
        project.status = "analyzed";
      } else {
        Logger.warn(`⚠ Failed to extract data from Excel: ${path.basename(project.excelFilePath)}`);
        project.status = "analysis_failed";
      }
    } catch (err) {
      Logger.error(`Error analyzing project: ${err.message}`);
      project.status = "analysis_failed";
    }

    return project;
  }

  /**
   * Attempts to read and parse an Excel file.
   * Extracts tool data and validates structure.
   * @param {string} excelPath - Path to Excel file
   * @returns {object|null} Extracted data or null if failed
   */
  validateAndExtractExcel(excelPath) {
    try {
      if (!fs.existsSync(excelPath)) {
        Logger.error(`Excel file does not exist: ${excelPath}`);
        return null;
      }

      // Check file extension
      const extension = path.extname(excelPath).toLowerCase();
      if (!['.xlsx', '.xls', '.xlsm'].includes(extension)) {
        Logger.error(`Invalid file extension: ${extension}. Expected .xlsx, .xls, or .xlsm`);
        return null;
      }

      Logger.info(`Processing Excel file: ${path.basename(excelPath)}`);

      // Use ExcelProcessor to extract data
      const extractedData = this.excelProcessor.processExcelFile(excelPath);

      if (!extractedData) {
        Logger.error(`Failed to process Excel file: ${path.basename(excelPath)}`);
        return null;
      }

      // Validate extracted data structure
      if (!this.validateExtractedData(extractedData)) {
        Logger.error(`Invalid data structure in Excel file: ${path.basename(excelPath)}`);
        return null;
      }

      Logger.info(`Successfully extracted data from ${path.basename(excelPath)}`);
      return extractedData;

    } catch (err) {
      Logger.error(`Error processing Excel file ${path.basename(excelPath)}: ${err.message}`);
      return null;
    }
  }

  /**
   * Validate the structure of extracted data.
   * @param {object} data - Extracted data to validate
   * @returns {boolean} True if valid
   */
  validateExtractedData(data) {
    try {
      // Check if data exists and has required properties
      if (!data || typeof data !== 'object') {
        Logger.warn("Extracted data is not an object");
        return false;
      }

      // Check for tools array
      if (!Array.isArray(data.tools)) {
        Logger.warn("Extracted data does not contain a tools array");
        return false;
      }

      // Validate each tool has required properties
      for (let i = 0; i < data.tools.length; i++) {
        const tool = data.tools[i];
        if (!tool || typeof tool !== 'object') {
          Logger.warn(`Tool at index ${i} is not a valid object`);
          return false;
        }

        // Check for essential tool properties
        if (!tool.id && !tool.name && !tool.toolNumber) {
          Logger.warn(`Tool at index ${i} lacks identification (id, name, or toolNumber)`);
          return false;
        }
      }

      // Check metadata if present
      if (data.metadata) {
        if (typeof data.metadata !== 'object') {
          Logger.warn("Metadata is not an object");
          return false;
        }
      }

      return true;

    } catch (err) {
      Logger.error(`Error validating extracted data: ${err.message}`);
      return false;
    }
  }

  /**
   * Get basic statistics about the extracted data.
   * @param {object} data - Extracted data
   * @returns {object} Statistics object
   */
  getDataStatistics(data) {
    if (!data || !Array.isArray(data.tools)) {
      return {
        toolCount: 0,
        hasMetadata: false,
        isEmpty: true
      };
    }

    return {
      toolCount: data.tools.length,
      hasMetadata: !!data.metadata,
      isEmpty: data.tools.length === 0,
      hasValidTools: data.tools.every(tool => tool && typeof tool === 'object')
    };
  }

  /**
   * Clean and normalize extracted data.
   * @param {object} data - Raw extracted data
   * @returns {object} Cleaned data
   */
  cleanExtractedData(data) {
    if (!data || !Array.isArray(data.tools)) {
      return { tools: [], metadata: {} };
    }

    // Clean and normalize tools
    const cleanedTools = data.tools
      .filter(tool => tool && typeof tool === 'object')
      .map(tool => this.cleanToolData(tool));

    return {
      tools: cleanedTools,
      metadata: data.metadata || {},
      statistics: this.getDataStatistics({ tools: cleanedTools, metadata: data.metadata })
    };
  }

  /**
   * Clean and normalize individual tool data.
   * @param {object} tool - Raw tool data
   * @returns {object} Cleaned tool data
   */
  cleanToolData(tool) {
    // Remove undefined and null values
    const cleaned = {};
    
    for (const [key, value] of Object.entries(tool)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}

module.exports = Analyzer;
