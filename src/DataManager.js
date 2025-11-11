/**
 * DataManager for ToolManager
 * Provides tool-specific data operations using local JSON files
 */

const fs = require("fs").promises;
const path = require("path");
const config = require("../config");

class DataManager {
  constructor() {
    this.initialized = false;
    this.resultsPath = this.getResultsPath();
  }

  /**
   * Get the path to the results directory based on config
   */
  getResultsPath() {
    if (config.app.testMode && config.app.testProcessedDataPath) {
      return path.join(
        config.app.testProcessedDataPath,
        "BRK CNC Management Dashboard",
        "ToolManager",
        "results"
      );
    } else if (config.app.userDefinedWorkingFolder) {
      return path.join(
        config.app.userDefinedWorkingFolder,
        config.app.tempBaseName || "BRK CNC Management Dashboard",
        "ToolManager",
        "results"
      );
    } else {
      return path.join(
        require("os").tmpdir(),
        config.app.tempBaseName || "BRK CNC Management Dashboard",
        "ToolManager",
        "results"
      );
    }
  }

  async initialize() {
    if (this.initialized) return;
    console.log(`📊 ToolManager DataManager initialized with local storage`);
    console.log(`📁 Results path: ${this.resultsPath}`);
    this.initialized = true;
  }

  /**
   * Get all tools from the latest ToolManager_Result.json
   */
  async getAllTools(filter = {}) {
    try {
      const resultFile = path.join(this.resultsPath, "ToolManager_Result.json");
      const fileContent = await fs.readFile(resultFile, "utf8");
      const data = JSON.parse(fileContent);

      let tools = data.tools || [];

      // Apply filters if provided
      if (filter.status) {
        tools = tools.filter((t) => t.status === filter.status);
      }
      if (filter.isMatrix !== undefined) {
        tools = tools.filter((t) => t.isMatrix === filter.isMatrix);
      }

      return tools;
    } catch (error) {
      console.error(`Failed to read tools data: ${error.message}`);
      return [];
    }
  }

  /**
   * Get tool by ID
   */
  async getToolById(toolId) {
    try {
      const tools = await this.getAllTools();
      return tools.find((t) => t.id === toolId) || null;
    } catch (error) {
      console.error(`Failed to get tool by ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Get tool by name
   */
  async getToolByName(toolName) {
    try {
      const tools = await this.getAllTools();
      return tools.find((t) => t.name === toolName) || null;
    } catch (error) {
      console.error(`Failed to get tool by name: ${error.message}`);
      return null;
    }
  }

  /**
   * Get projects (upcoming work orders)
   */
  async getProjects() {
    try {
      const tools = await this.getAllTools();
      // Group by project if projectCount exists
      const projects = [];
      const projectMap = new Map();

      tools.forEach((tool) => {
        if (tool.projectCount && tool.projectCount > 0) {
          const key = `project_${tool.id}`;
          if (!projectMap.has(key)) {
            projectMap.set(key, {
              id: key,
              name: `Work Order ${tool.id}`,
              tools: [],
              totalUsageTime: 0,
            });
          }
          const project = projectMap.get(key);
          project.tools.push(tool);
          project.totalUsageTime += tool.usageTime || 0;
        }
      });

      return Array.from(projectMap.values());
    } catch (error) {
      console.error(`Failed to get projects: ${error.message}`);
      return [];
    }
  }

  /**
   * Get upcoming tools analysis
   */
  async getUpcomingTools() {
    try {
      const tools = await this.getAllTools({ status: "in_use" });
      return {
        totalTools: tools.length,
        totalUsageTime: tools.reduce((sum, t) => sum + (t.usageTime || 0), 0),
        toolsByType: this.groupToolsByType(tools),
        topTools: tools.slice(0, 10), // Top 10 by usage time
      };
    } catch (error) {
      console.error(`Failed to get upcoming tools: ${error.message}`);
      return {
        totalTools: 0,
        totalUsageTime: 0,
        toolsByType: {},
        topTools: [],
      };
    }
  }

  /**
   * Group tools by type (helper method)
   */
  groupToolsByType(tools) {
    const grouped = {};
    tools.forEach((tool) => {
      const type = this.extractToolType(tool.name);
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(tool);
    });
    return grouped;
  }

  /**
   * Extract tool type from name (helper method)
   */
  extractToolType(toolName) {
    if (!toolName) return "Unknown";
    const parts = toolName.split("-");
    return parts[0] || "Unknown";
  }

  async addTool(toolData) {
    return null;
  }

  async updateTool(toolId, updateData) {
    return null;
  }

  async deleteTool(toolId) {
    return null;
  }

  async getAllMatrices(filter = {}) {
    return [];
  }

  async getMatrixByName(matrixName) {
    return null;
  }

  async addMatrix(matrixData) {
    return null;
  }

  async updateMatrix(matrixName, updateData) {
    return null;
  }

  async getToolLocation(toolId) {
    return null;
  }

  async updateToolLocation(toolId, locationData) {
    return null;
  }

  async getAllToolLocations() {
    return [];
  }

  async logExcelProcessing(logData) {
    return null;
  }

  async getExcelProcessingHistory(limit = 100) {
    return [];
  }

  async getToolUsageStats() {
    try {
      const tools = await this.getAllTools();
      return {
        totalTools: tools.length,
        activeTools: tools.filter((t) => t.status === "in_use").length,
        toolsInUse: tools.filter((t) => t.status === "in_use").length,
        toolsAvailable: tools.filter((t) => t.status === "available").length,
        matrixTools: tools.filter((t) => t.isMatrix === true).length,
        nonMatrixTools: tools.filter((t) => t.isMatrix === false).length,
      };
    } catch (error) {
      console.error(`Failed to get tool usage stats: ${error.message}`);
      return {
        totalTools: 0,
        activeTools: 0,
        toolsInUse: 0,
        toolsAvailable: 0,
        matrixTools: 0,
        nonMatrixTools: 0,
      };
    }
  }

  async getMatrixToolsReport(matrixName) {
    return null;
  }

  async migrateExcelData(excelData) {
    return {
      tools: 0,
      matrices: 0,
      locations: 0,
      errors: [],
    };
  }

  async healthCheck() {
    if (!this.initialized) {
      return { status: "not_initialized" };
    }
    return {
      status: "ok",
      dataManager: "operational",
      stats: await this.getToolUsageStats(),
    };
  }

  async createBackup() {
    return { status: "not_implemented" };
  }

  async disconnect() {
    this.initialized = false;
  }
}

module.exports = DataManager;
