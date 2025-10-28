// src/models/Matrix.js
/**
 * Matrix model for managing tool collections
 * Equivalent to Java Matrix class
 */
const Tool = require('./Tool');

class Matrix {
  constructor() {
    this.toolList = [];
  }

  /**
   * Static tool list for global access (mimicking Java static behavior)
   */
  static toolList = [];

  /**
   * Print all tools in the matrix
   */
  static printAllTool() {
    for (const oneTool of Matrix.toolList) {
      let base = `D${oneTool.diameter} P${oneTool.toolCode} - ${oneTool.toolState} - ${oneTool.currentTime} -`;
      
      base += ' - Projects: ';

      if (!oneTool.projectList || oneTool.projectList.length === 0) {
        base += 'null';
      } else {
        const projectStrings = oneTool.projectList.map(project => 
          `${project.workNumber}${project.version}${project.pieceNumber}-${project.technologyNumber}`
        );
        base += projectStrings.join(', ');
      }

      console.log(base);
    }
  }

  /**
   * Update all tool states in the matrix
   */
  updateAllToolState() {
    for (const oneTool of Matrix.toolList) {
      oneTool.updateToolState();
    }
  }

  /**
   * Add a tool to the matrix
   * @param {Tool} tool - Tool to add
   */
  static addTool(tool) {
    if (tool instanceof Tool) {
      Matrix.toolList.push(tool);
    } else {
      throw new Error('Only Tool instances can be added to the matrix');
    }
  }

  /**
   * Remove a tool from the matrix
   * @param {Tool} tool - Tool to remove
   */
  static removeTool(tool) {
    const index = Matrix.toolList.indexOf(tool);
    if (index > -1) {
      Matrix.toolList.splice(index, 1);
    }
  }

  /**
   * Find a tool by diameter and tool code
   * @param {number} diameter - Tool diameter
   * @param {number} toolCode - Tool code
   * @returns {Tool|null} - Found tool or null
   */
  static findTool(diameter, toolCode) {
    return Matrix.toolList.find(tool => 
      tool.diameter === diameter && tool.toolCode === toolCode
    ) || null;
  }

  /**
   * Find all tools with specific state
   * @param {string} state - Tool state to filter by
   * @returns {Array} - Array of tools with the specified state
   */
  static findToolsByState(state) {
    return Matrix.toolList.filter(tool => tool.toolState === state);
  }

  /**
   * Get all tools
   * @returns {Array} - Array of all tools
   */
  static getAllTools() {
    return [...Matrix.toolList]; // Return copy to prevent external modification
  }

  /**
   * Clear all tools from the matrix
   */
  static clearAllTools() {
    Matrix.toolList.length = 0;
  }

  /**
   * Get tool count
   * @returns {number} - Number of tools in matrix
   */
  static getToolCount() {
    return Matrix.toolList.length;
  }

  /**
   * Get summary statistics
   * @returns {Object} - Summary statistics object
   */
  static getSummary() {
    const summary = {
      totalTools: Matrix.toolList.length,
      freeTools: 0,
      inUseTools: 0,
      maxedTools: 0,
      inDebtTools: 0
    };

    for (const tool of Matrix.toolList) {
      switch (tool.toolState) {
        case 'FREE':
          summary.freeTools++;
          break;
        case 'INUSE':
          summary.inUseTools++;
          break;
        case 'MAXED':
          summary.maxedTools++;
          break;
        case 'INDEBT':
          summary.inDebtTools++;
          break;
      }
    }

    return summary;
  }
}

module.exports = Matrix;