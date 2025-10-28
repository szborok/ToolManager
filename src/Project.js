// src/models/Project.js
/**
 * Project model representing a manufacturing project
 * Equivalent to Java Project class
 */
class Project {
  /**
   * Create a new Project instance
   * @param {number} workNumber - Work number (will be prefixed with 'W')
   * @param {string} version - Version string (will be uppercased)
   * @param {number} pieceNumber - Piece number
   * @param {number} technologyNumber - Technology number (will be prefixed with 'T')
   * @param {number} cuttingTime - Cutting time in minutes
   * @param {Date} manufactureDate - Date of manufacture
   */
  constructor(workNumber, version, pieceNumber, technologyNumber, cuttingTime, manufactureDate) {
    this.workNumber = `W${workNumber}`;
    this.version = version.toUpperCase();
    this.pieceNumber = pieceNumber;
    this.technologyNumber = `T${technologyNumber}`;
    this.cuttingTime = cuttingTime;
    this.manufactureDate = manufactureDate;
  }

  /**
   * Get string representation of the project
   * @returns {string} - Formatted project string
   */
  toString() {
    return `${this.workNumber}${this.version}${this.pieceNumber}${this.technologyNumber} - Work time: ${this.cuttingTime} minutes, Date of use: ${this.manufactureDate.toLocaleDateString()}`;
  }

  /**
   * Get the full project identifier
   * @returns {string} - Full project ID (e.g., "W5154NS01005T80")
   */
  getFullId() {
    return `${this.workNumber}${this.version}${this.pieceNumber}${this.technologyNumber}`;
  }
}

module.exports = Project;