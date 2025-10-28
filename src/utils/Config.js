// src/utils/Config.js
/**
 * Configuration management utility
 * Equivalent to Java Config class
 */
const fs = require('fs');
const path = require('path');

class Config {
  static properties = new Map();
  static initialized = false;

  /**
   * Initialize configuration by loading properties file
   */
  static initialize() {
    if (Config.initialized) {
      return;
    }

    const configPath = Config.locateConfigFile();
    
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      Config.parseProperties(configContent);
      console.log(`Configuration successfully loaded from: ${configPath}`);
      Config.initialized = true;
    } catch (error) {
      throw new Error(`Failed to load configuration file from: ${configPath}. Error: ${error.message}`);
    }
  }

  /**
   * Locate the config.properties file
   * @returns {string} - Path to config file
   */
  static locateConfigFile() {
    const workingDir = process.cwd();
    const configFile = path.join(workingDir, 'companyConfig', 'config.properties');
    
    if (!fs.existsSync(configFile)) {
      throw new Error(`Configuration file not found at: ${configFile}`);
    }
    
    return configFile;
  }

  /**
   * Parse properties file content
   * @param {string} content - Properties file content
   */
  static parseProperties(content) {
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
        continue;
      }
      
      const separatorIndex = trimmedLine.indexOf('=');
      if (separatorIndex > 0) {
        const key = trimmedLine.substring(0, separatorIndex).trim();
        const value = trimmedLine.substring(separatorIndex + 1).trim();
        Config.properties.set(key, value);
      }
    }
  }

  /**
   * Get property value with optional default
   * @param {string} key - Property key
   * @param {string} defaultValue - Default value if key not found
   * @returns {string} - Property value or default
   */
  static getProperty(key, defaultValue = null) {
    if (!Config.initialized) {
      Config.initialize();
    }
    
    return Config.properties.get(key) || defaultValue;
  }

  /**
   * Set property value
   * @param {string} key - Property key
   * @param {string} value - Property value
   */
  static setProperty(key, value) {
    Config.properties.set(key, value);
  }

  /**
   * Generate filename with date placeholder replacement
   * @param {string} pattern - Filename pattern with {date} placeholder
   * @returns {string} - Filename with current date
   */
  static generateFileName(pattern) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return pattern.replace('{date}', dateStr);
  }

  /**
   * Get all properties
   * @returns {Map} - All properties
   */
  static getAllProperties() {
    if (!Config.initialized) {
      Config.initialize();
    }
    
    return new Map(Config.properties);
  }

  /**
   * Check if configuration is initialized
   * @returns {boolean} - True if initialized
   */
  static isInitialized() {
    return Config.initialized;
  }
}

module.exports = Config;