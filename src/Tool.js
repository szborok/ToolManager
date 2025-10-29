// src/Tool.js
/**
 * Tool model representing a cutting tool
 * Supports both Matrix Tools (with inventory) and Non-Matrix Tools (usage only)
 */
const { v4: uuidv4 } = require("uuid");
const ToolState = require("../utils/ToolState");
const {
  getToolIdentityFromMatrixCode,
  getToolIdentityFromDiameterAndToolCode,
  ToolCategory
} = require("../utils/ToolIdentity");

class Tool {
  /**
   * Create a new Tool instance
   * @param {string} matrixCode - Tool matrix code (e.g., "RT-8400300")
   * @param {number} diameter - Tool diameter
   * @param {number} toolCode - Tool code
   * @param {Object} options - Additional options
   */
  constructor(matrixCode, diameter = null, toolCode = null, options = {}) {
    this.id = uuidv4();
    this.matrixCode = matrixCode;
    this.diameter = diameter;
    this.toolCode = toolCode;
    
    // Get tool identity from matrix code
    this.toolIdentity = getToolIdentityFromMatrixCode(matrixCode);
    
    // Tool properties
    this.maxTime = options.maxTime || (this.toolIdentity ? this.toolIdentity.maxToolTime : 0);
    this.overrunPercentage = options.overrunPercentage || 10; // Default 10% overrun allowance
    this.currentTime = 0;
    this.currentQuantity = options.currentQuantity || 0;
    this.description = options.description || '';
    
    // Usage tracking
    this.projectList = [];
    this.usageHistory = [];
    this.toolState = ToolState.FREE;
  }

  /**
   * Get string representation of the tool
   * @returns {string} - Formatted tool string
   */
  toString() {
    const category = this.toolIdentity.category;
    const inventory = this.isMatrixTool() ? ` (Qty: ${this.currentQuantity})` : ' (Usage Only)';
    return `Tool ID: ${this.id} - ${this.matrixCode}${inventory} - ${category}`;
  }

  /**
   * Check if this is a matrix tool (has inventory tracking)
   * @returns {boolean}
   */
  isMatrixTool() {
    return this.toolIdentity.isMatrixTool;
  }

  /**
   * Check if this tool has inventory tracking
   * @returns {boolean}
   */
  hasInventoryTracking() {
    return this.toolIdentity.hasInventoryTracking;
  }

  /**
   * Get the tool category
   * @returns {string}
   */
  getCategory() {
    return this.toolIdentity.category;
  }

  /**
   * Get the current tool state
   * @returns {string} - Current tool state
   */
  getToolState() {
    return this.toolState;
  }

  /**
   * Calculate maximum allowed time including overrun
   * @returns {number} - Max time with overrun allowance
   */
  getMaxTimeWithOverrun() {
    return this.maxTime * (1 + this.overrunPercentage / 100);
  }

  /**
   * Add usage record
   * @param {Object} usageRecord - Usage information
   */
  addUsage(usageRecord) {
    this.usageHistory.push({
      ...usageRecord,
      timestamp: new Date().toISOString()
    });
    
    // Update current time if provided
    if (usageRecord.usageTime) {
      this.currentTime += usageRecord.usageTime;
    }
    
    // Update tool state based on usage
    this.updateToolState();
  }

  /**
   * Get total usage time from history
   * @returns {number}
   */
  getTotalUsageTime() {
    return this.usageHistory.reduce((total, usage) => {
      return total + (usage.usageTime || 0);
    }, 0);
  }

  /**
   * Check if tool is approaching max time
   * @returns {boolean}
   */
  isApproachingMaxTime() {
    const maxWithOverrun = this.getMaxTimeWithOverrun();
    return this.currentTime >= (maxWithOverrun * 0.8); // 80% threshold
  }

  /**
   * Check if tool has exceeded max time
   * @returns {boolean}
   */
  hasExceededMaxTime() {
    return this.currentTime > this.getMaxTimeWithOverrun();
  }

  /**
   * Update tool state based on current time vs max time
   */
  updateToolState() {
    if (!this.isMatrixTool()) {
      // Non-matrix tools don't have time limits
      this.toolState = ToolState.IN_USE;
      return;
    }

    const maxWithOverrun = this.getMaxTimeWithOverrun();
    
    if (this.currentTime === 0) {
      this.toolState = ToolState.FREE;
    } else if (this.currentTime < this.maxTime) {
      this.toolState = ToolState.IN_USE;
    } else if (this.currentTime <= maxWithOverrun) {
      this.toolState = ToolState.OVERRUN;
    } else {
      this.toolState = ToolState.EXPIRED;
    }
  }

  /**
   * Predict inventory impact for matrix tools
   * @param {number} plannedUsageTime - Planned usage time
   * @returns {Object} - Prediction results
   */
  predictInventoryImpact(plannedUsageTime) {
    if (!this.isMatrixTool()) {
      return {
        hasInventory: false,
        message: 'Non-matrix tool - usage tracking only'
      };
    }

    const toolsNeeded = Math.ceil(plannedUsageTime / this.getMaxTimeWithOverrun());
    const available = this.currentQuantity;
    
    return {
      hasInventory: true,
      toolsNeeded,
      available,
      sufficient: available >= toolsNeeded,
      shortage: Math.max(0, toolsNeeded - available),
      message: available >= toolsNeeded 
        ? `Sufficient inventory: ${available} available, ${toolsNeeded} needed`
        : `Inventory shortage: ${toolsNeeded} needed, only ${available} available (shortage: ${toolsNeeded - available})`
    };
  }

  /**
   * Get usage statistics
   * @returns {Object}
   */
  getUsageStatistics() {
    const totalUsage = this.getTotalUsageTime();
    const usageCount = this.usageHistory.length;
    const avgUsage = usageCount > 0 ? totalUsage / usageCount : 0;
    
    return {
      totalUsageTime: totalUsage,
      usageCount,
      averageUsageTime: avgUsage,
      currentTime: this.currentTime,
      maxTime: this.maxTime,
      maxTimeWithOverrun: this.getMaxTimeWithOverrun(),
      utilizationPercentage: this.maxTime > 0 ? (this.currentTime / this.maxTime) * 100 : 0,
      isApproachingLimit: this.isApproachingMaxTime(),
      hasExceeded: this.hasExceededMaxTime(),
      category: this.getCategory(),
      isMatrixTool: this.isMatrixTool()
    };
  }

  /**
   * Legacy compatibility methods
   */
  addProject(project) {
    if (!this.projectList.includes(project)) {
      this.projectList.push(project);
    }
  }

  removeProject(project) {
    const index = this.projectList.indexOf(project);
    if (index > -1) {
      this.projectList.splice(index, 1);
    }
  }

  addCuttingTime(time) {
    this.addUsage({ usageTime: time });
  }

  getRemainingTime() {
    return Math.max(0, this.maxTime - this.currentTime);
  }

  canHandleTime(additionalTime) {
    return this.currentTime + additionalTime <= this.getMaxTimeWithOverrun();
  }

  /**
   * Export tool data for reporting
   * @returns {Object}
   */
  toReportData() {
    return {
      id: this.id,
      matrixCode: this.matrixCode,
      diameter: this.diameter,
      toolCode: this.toolCode,
      category: this.getCategory(),
      isMatrixTool: this.isMatrixTool(),
      hasInventoryTracking: this.hasInventoryTracking(),
      currentQuantity: this.currentQuantity,
      description: this.description,
      maxTime: this.maxTime,
      overrunPercentage: this.overrunPercentage,
      maxTimeWithOverrun: this.getMaxTimeWithOverrun(),
      currentTime: this.currentTime,
      toolState: this.toolState,
      usageStatistics: this.getUsageStatistics(),
      recentUsage: this.usageHistory.slice(-5) // Last 5 usage records
    };
  }
}

module.exports = Tool;
