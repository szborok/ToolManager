// src/utils/Logger.js
/**
 * Logger utility for ToolManager
 * Simplified logging system similar to JSON Scanner pattern
 */
const fs = require('fs');
const path = require('path');

class Logger {
  static logLevel = 'info';
  static logFile = null;
  static consoleEnabled = true;

  /**
   * Initialize logger with configuration
   * @param {Object} config - Logger configuration
   */
  static initialize(config = {}) {
    Logger.logLevel = config.level || 'info';
    Logger.consoleEnabled = config.console !== false;
    
    if (config.file) {
      Logger.logFile = config.file;
      Logger.ensureLogDirectory();
    }
  }

  /**
   * Ensure log directory exists
   */
  static ensureLogDirectory() {
    if (Logger.logFile) {
      const logDir = path.dirname(Logger.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Get formatted timestamp
   * @returns {string} - Formatted timestamp
   */
  static getTimestamp() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  /**
   * Write log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   */
  static writeLog(level, message) {
    const timestamp = Logger.getTimestamp();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Console output
    if (Logger.consoleEnabled) {
      console.log(logMessage);
    }
    
    // File output
    if (Logger.logFile) {
      try {
        fs.appendFileSync(Logger.logFile, logMessage + '\n', 'utf8');
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    }
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   */
  static info(message) {
    Logger.writeLog('info', message);
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   */
  static error(message) {
    Logger.writeLog('error', message);
  }

  /**
   * Log warning message
   * @param {string} message - Message to log
   */
  static warn(message) {
    Logger.writeLog('warn', message);
  }

  /**
   * Log debug message
   * @param {string} message - Message to log
   */
  static debug(message) {
    if (Logger.logLevel === 'debug') {
      Logger.writeLog('debug', message);
    }
  }

  /**
   * Setup file naming with date-based log files
   */
  static setupFileNaming() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const logDir = 'logs';
    const logFileName = `tool-manager-${dateStr}.log`;
    
    Logger.initialize({
      level: 'info',
      file: path.join(logDir, logFileName),
      console: true
    });
    
    Logger.info('Logger initialized with file: ' + logFileName);
  }
}

module.exports = Logger;