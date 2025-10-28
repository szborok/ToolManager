// src/factories/ToolFactory.js
/**
 * Tool factory for creating and managing tools
 * Equivalent to Java ToolFactory class
 */
const Tool = require('../models/Tool');
const Matrix = require('../models/Matrix');
const Constants = require('../utils/Constants');
const FileConverter = require('../utils/FileConverter');
const Logger = require('../utils/Logger');

class ToolFactory {
  /**
   * Upload tools from JSON file to Matrix tool list
   */
  uploadToolsFromJSON() {
    try {
      Logger.info('Starting tool upload from JSON...');
      
      const jsonPath = Constants.Paths.MATRIX_JSON_FILE;
      
      if (!FileConverter.fileExists(jsonPath)) {
        throw new Error(`JSON file not found: ${jsonPath}`);
      }

      // Read JSON data
      const jsonData = FileConverter.readJsonFile(jsonPath);
      Logger.info(`Loaded ${jsonData.length} records from JSON file`);

      // Process each record and create tools
      let toolsCreated = 0;
      let toolsUpdated = 0;

      for (const record of jsonData) {
        const result = this.processToolRecord(record);
        if (result.created) {
          toolsCreated++;
        } else if (result.updated) {
          toolsUpdated++;
        }
      }

      Logger.info(`Tool upload completed: ${toolsCreated} created, ${toolsUpdated} updated`);
      
      return {
        success: true,
        toolsCreated,
        toolsUpdated,
        totalProcessed: jsonData.length
      };
      
    } catch (error) {
      Logger.error(`Tool upload failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process a single tool record from JSON
   * @param {Object} record - Tool record from JSON
   * @returns {Object} - Processing result
   */
  processToolRecord(record) {
    try {
      // Extract tool information from record
      // Assuming JSON structure has diameter and toolCode fields
      const diameter = this.parseNumericValue(record.diameter || record.Diameter);
      const toolCode = this.parseNumericValue(record.toolCode || record.ToolCode || record.tool_code);

      if (diameter === null || toolCode === null) {
        Logger.warn(`Skipping record with invalid diameter (${diameter}) or toolCode (${toolCode})`);
        return { created: false, updated: false, skipped: true };
      }

      // Check if tool already exists
      const existingTool = Matrix.findTool(diameter, toolCode);
      
      if (existingTool) {
        // Update existing tool if needed
        this.updateToolFromRecord(existingTool, record);
        return { created: false, updated: true, skipped: false };
      } else {
        // Create new tool
        const newTool = this.createToolFromRecord(diameter, toolCode, record);
        Matrix.addTool(newTool);
        return { created: true, updated: false, skipped: false };
      }
      
    } catch (error) {
      Logger.error(`Failed to process tool record: ${error.message}`);
      return { created: false, updated: false, skipped: true, error: error.message };
    }
  }

  /**
   * Create a new tool from JSON record
   * @param {number} diameter - Tool diameter
   * @param {number} toolCode - Tool code
   * @param {Object} record - JSON record
   * @returns {Tool} - New tool instance
   */
  createToolFromRecord(diameter, toolCode, record) {
    const tool = new Tool(diameter, toolCode);
    
    // Update tool with additional information from record
    this.updateToolFromRecord(tool, record);
    
    Logger.debug(`Created new tool: D${diameter} P${toolCode}`);
    return tool;
  }

  /**
   * Update tool with information from JSON record
   * @param {Tool} tool - Tool to update
   * @param {Object} record - JSON record
   */
  updateToolFromRecord(tool, record) {
    // Update current time if available
    const currentTime = this.parseNumericValue(record.currentTime || record.current_time);
    if (currentTime !== null) {
      tool.currentTime = currentTime;
    }

    // Update tool state
    tool.updateToolState();
    
    // Add any project information if available
    // This would depend on the actual JSON structure
    if (record.projects && Array.isArray(record.projects)) {
      // Process project information
      this.addProjectsToTool(tool, record.projects);
    }
  }

  /**
   * Add projects to a tool from JSON data
   * @param {Tool} tool - Tool to add projects to
   * @param {Array} projects - Array of project data
   */
  addProjectsToTool(tool, projects) {
    const Project = require('../models/Project');
    
    for (const projectData of projects) {
      try {
        const project = new Project(
          projectData.workNumber,
          projectData.version,
          projectData.pieceNumber,
          projectData.technologyNumber,
          projectData.cuttingTime,
          new Date(projectData.manufactureDate)
        );
        
        tool.addProject(project);
      } catch (error) {
        Logger.warn(`Failed to add project to tool: ${error.message}`);
      }
    }
  }

  /**
   * Parse numeric value from various formats
   * @param {any} value - Value to parse
   * @returns {number|null} - Parsed number or null
   */
  parseNumericValue(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Create tool manually
   * @param {number} diameter - Tool diameter
   * @param {number} toolCode - Tool code
   * @returns {Tool} - New tool instance
   */
  createTool(diameter, toolCode) {
    const tool = new Tool(diameter, toolCode);
    Matrix.addTool(tool);
    Logger.info(`Manually created tool: D${diameter} P${toolCode}`);
    return tool;
  }

  /**
   * Bulk create tools from array
   * @param {Array} toolSpecs - Array of {diameter, toolCode} objects
   * @returns {Array} - Array of created tools
   */
  bulkCreateTools(toolSpecs) {
    const createdTools = [];
    
    for (const spec of toolSpecs) {
      try {
        const tool = this.createTool(spec.diameter, spec.toolCode);
        createdTools.push(tool);
      } catch (error) {
        Logger.error(`Failed to create tool D${spec.diameter} P${spec.toolCode}: ${error.message}`);
      }
    }
    
    Logger.info(`Bulk created ${createdTools.length} tools`);
    return createdTools;
  }
}

module.exports = ToolFactory;