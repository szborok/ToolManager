/**
 * DataManager for ToolManager
 * Provides tool-specific data operations with unified storage
 */

const StorageAdapter = require("../utils/StorageAdapter");
const config = require("../config");

class DataManager {
  constructor() {
    this.storage = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    this.storage = new StorageAdapter(config.storage.type);
    await this.storage.initialize();

    console.log(
      `📊 ToolManager DataManager initialized with ${this.storage.getStorageType()} storage`
    );
    this.initialized = true;
  }

  // Tool Management Operations
  async getAllTools(filter = {}) {
    return await this.storage.findAll("tools", filter);
  }

  async getToolById(toolId) {
    return await this.storage.findOne("tools", { toolId });
  }

  async getToolByName(toolName) {
    return await this.storage.findOne("tools", { toolName });
  }

  async addTool(toolData) {
    // Add timestamps and validation
    const tool = {
      ...toolData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: toolData.status || "active",
    };

    return await this.storage.insertOne("tools", tool);
  }

  async updateTool(toolId, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    return await this.storage.updateOne("tools", { toolId }, update);
  }

  async deleteTool(toolId) {
    return await this.storage.deleteOne("tools", { toolId });
  }

  // Tool Matrix Operations
  async getAllMatrices(filter = {}) {
    return await this.storage.findAll("tool_matrices", filter);
  }

  async getMatrixByName(matrixName) {
    return await this.storage.findOne("tool_matrices", { matrixName });
  }

  async addMatrix(matrixData) {
    const matrix = {
      ...matrixData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.storage.insertOne("tool_matrices", matrix);
  }

  async updateMatrix(matrixName, updateData) {
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    return await this.storage.updateOne(
      "tool_matrices",
      { matrixName },
      update
    );
  }

  // Tool Location Tracking
  async getToolLocation(toolId) {
    return await this.storage.findOne("tool_locations", { toolId });
  }

  async updateToolLocation(toolId, locationData) {
    const location = {
      ...locationData,
      toolId,
      updatedAt: new Date(),
    };

    // Use upsert pattern
    const existing = await this.getToolLocation(toolId);
    if (existing) {
      return await this.storage.updateOne(
        "tool_locations",
        { toolId },
        location
      );
    } else {
      location.createdAt = new Date();
      return await this.storage.insertOne("tool_locations", location);
    }
  }

  async getAllToolLocations() {
    return await this.storage.findAll("tool_locations");
  }

  // Excel Processing Log
  async logExcelProcessing(logData) {
    const log = {
      ...logData,
      timestamp: new Date(),
      processedAt: new Date(),
    };

    return await this.storage.insertOne("excel_processing_log", log);
  }

  async getExcelProcessingHistory(limit = 100) {
    const logs = await this.storage.findAll("excel_processing_log");
    // Sort by timestamp descending and limit
    return logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Analytics and Reports
  async getToolUsageStats() {
    const tools = await this.getAllTools();
    const locations = await this.getAllToolLocations();

    return {
      totalTools: tools.length,
      activeTools: tools.filter((t) => t.status === "active").length,
      toolsInUse: locations.filter((l) => l.status === "in_use").length,
      toolsAvailable: locations.filter((l) => l.status === "available").length,
    };
  }

  async getMatrixToolsReport(matrixName) {
    const matrix = await this.getMatrixByName(matrixName);
    if (!matrix) return null;

    const toolIds = matrix.tools || [];
    const tools = [];

    for (const toolId of toolIds) {
      const tool = await this.getToolById(toolId);
      const location = await this.getToolLocation(toolId);

      if (tool) {
        tools.push({
          ...tool,
          location: location || { status: "unknown" },
        });
      }
    }

    return {
      matrix: matrix.matrixName,
      totalTools: tools.length,
      tools,
    };
  }

  // Migration from Excel data
  async migrateExcelData(excelData) {
    console.log("🔄 Starting Excel data migration...");

    const migrationResults = {
      tools: 0,
      matrices: 0,
      locations: 0,
      errors: [],
    };

    try {
      // Migrate tools if they exist in Excel data
      if (excelData.tools && Array.isArray(excelData.tools)) {
        for (const tool of excelData.tools) {
          try {
            await this.addTool(tool);
            migrationResults.tools++;
          } catch (error) {
            migrationResults.errors.push(
              `Tool ${tool.toolId}: ${error.message}`
            );
          }
        }
      }

      // Migrate matrices
      if (excelData.matrices && Array.isArray(excelData.matrices)) {
        for (const matrix of excelData.matrices) {
          try {
            await this.addMatrix(matrix);
            migrationResults.matrices++;
          } catch (error) {
            migrationResults.errors.push(
              `Matrix ${matrix.matrixName}: ${error.message}`
            );
          }
        }
      }

      // Migrate locations
      if (excelData.locations && Array.isArray(excelData.locations)) {
        for (const location of excelData.locations) {
          try {
            await this.updateToolLocation(location.toolId, location);
            migrationResults.locations++;
          } catch (error) {
            migrationResults.errors.push(
              `Location ${location.toolId}: ${error.message}`
            );
          }
        }
      }

      console.log("✅ Excel data migration completed:", migrationResults);
      return migrationResults;
    } catch (error) {
      console.error("❌ Migration failed:", error);
      migrationResults.errors.push(`General migration error: ${error.message}`);
      return migrationResults;
    }
  }

  // Health check and backup
  async healthCheck() {
    if (!this.initialized) {
      return { status: "not_initialized" };
    }

    const storageHealth = await this.storage.healthCheck();
    const stats = await this.getToolUsageStats();

    return {
      ...storageHealth,
      dataManager: "operational",
      stats,
    };
  }

  async createBackup() {
    return await this.storage.createBackup();
  }

  async disconnect() {
    if (this.storage) {
      await this.storage.disconnect();
    }
    this.initialized = false;
  }
}

module.exports = DataManager;
