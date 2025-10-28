// src/models/Tool.js
/**
 * Tool model representing a cutting tool
 * Equivalent to Java Tool class
 */
const { v4: uuidv4 } = require('uuid');
const ToolState = require('../enums/ToolState');
const { getToolIdentityFromDiameterAndToolCode } = require('../enums/ToolIdentity');

class Tool {
  /**
   * Create a new Tool instance
   * @param {number} diameter - Tool diameter
   * @param {number} toolCode - Tool code
   */
  constructor(diameter, toolCode) {
    this.id = uuidv4();
    this.diameter = diameter;
    this.toolCode = toolCode;
    this.toolIdentity = getToolIdentityFromDiameterAndToolCode(diameter, toolCode);
    this.maxTime = this.toolIdentity ? this.toolIdentity.maxToolTime : 0;
    this.currentTime = 0;
    this.projectList = [];
    this.toolState = ToolState.FREE;
  }

  /**
   * Get string representation of the tool
   * @returns {string} - Formatted tool string
   */
  toString() {
    return `Tool ID: ${this.id} - D${this.diameter} ${this.toolCode}`;
  }

  /**
   * Get the current tool state
   * @returns {string} - Current tool state
   */
  getToolState() {
    return this.toolState;
  }

  /**
   * Update tool state based on current time vs max time
   */
  updateToolState() {
    if (this.currentTime === 0) {
      this.toolState = ToolState.FREE;
    } else if (this.currentTime < this.maxTime) {
      this.toolState = ToolState.INUSE;
    } else if (this.currentTime > this.maxTime) {
      this.toolState = ToolState.MAXED;
    }
  }

  /**
   * Add a project to this tool
   * @param {Project} project - Project to add
   */
  addProject(project) {
    if (!this.projectList.includes(project)) {
      this.projectList.push(project);
    }
  }

  /**
   * Remove a project from this tool
   * @param {Project} project - Project to remove
   */
  removeProject(project) {
    const index = this.projectList.indexOf(project);
    if (index > -1) {
      this.projectList.splice(index, 1);
    }
  }

  /**
   * Add cutting time to the tool
   * @param {number} time - Time to add in minutes
   */
  addCuttingTime(time) {
    this.currentTime += time;
    this.updateToolState();
  }

  /**
   * Get remaining tool life in minutes
   * @returns {number} - Remaining time before tool is maxed
   */
  getRemainingTime() {
    return Math.max(0, this.maxTime - this.currentTime);
  }

  /**
   * Check if tool can handle additional cutting time
   * @param {number} additionalTime - Time to check in minutes
   * @returns {boolean} - True if tool can handle the time
   */
  canHandleTime(additionalTime) {
    return (this.currentTime + additionalTime) <= this.maxTime;
  }
}

module.exports = Tool;