// src/utils/Config.js
/**
 * Configuration management utility
 * Equivalent to Java Config class with additional path resolution
 */
const fs = require("fs");
const path = require("path");

class Config {
  static properties = new Map();
  static initialized = false;
  static baseDirectory = null;

  /**
   * Initialize configuration by loading properties file
   */
  static initialize() {
    if (Config.initialized) {
      return;
    }

    const configPath = Config.locateConfigFile();

    try {
      const configContent = fs.readFileSync(configPath, "utf8");
      Config.parseProperties(configContent);

      // Set base directory
      Config.baseDirectory = Config.resolveBasePath();

      console.log(`Configuration successfully loaded from: ${configPath}`);
      console.log(`Base directory: ${Config.baseDirectory}`);
      Config.initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to load configuration file from: ${configPath}. Error: ${error.message}`
      );
    }
  }

  /**
   * Resolve base application path
   * @returns {string} - Absolute base path
   */
  static resolveBasePath() {
    const baseProperty = Config.properties.get("app.base.directory") || ".";
    const workingDir = process.cwd();

    if (path.isAbsolute(baseProperty)) {
      return baseProperty;
    }

    return path.resolve(workingDir, baseProperty);
  }

  /**
   * Get absolute path for a configured folder
   * @param {string} folderKey - Configuration key for folder (e.g., 'files.to.process.folder')
   * @param {boolean} createIfNotExists - Create directory if it doesn't exist
   * @returns {string} - Absolute path to folder
   */
  static getFolderPath(folderKey, createIfNotExists = false) {
    if (!Config.initialized) {
      Config.initialize();
    }

    const relativePath = Config.properties.get(folderKey);
    if (!relativePath) {
      throw new Error(`Folder configuration not found: ${folderKey}`);
    }

    const absolutePath = path.resolve(Config.baseDirectory, relativePath);

    if (createIfNotExists && !fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
      console.log(`Created directory: ${absolutePath}`);
    }

    return absolutePath;
  }

  /**
   * Get absolute path for a configured file
   * @param {string} fileKey - Configuration key for file (e.g., 'tool.definitions.file')
   * @returns {string} - Absolute path to file
   */
  static getFilePath(fileKey) {
    if (!Config.initialized) {
      Config.initialize();
    }

    const relativePath = Config.properties.get(fileKey);
    if (!relativePath) {
      throw new Error(`File configuration not found: ${fileKey}`);
    }

    return path.resolve(Config.baseDirectory, relativePath);
  }

  /**
   * Get all configured folder paths
   * @param {boolean} createIfNotExists - Create directories if they don't exist
   * @returns {Object} - Object with folder names and their absolute paths
   */
  static getAllFolderPaths(createIfNotExists = false) {
    const folders = {};
    const folderKeys = [
      "files.to.process.folder",
      "files.processed.folder",
      "work.tracking.folder",
      "archive.folder",
      "log.folder",
      "sample.excels.folder",
      "config.folder",
      "temp.folder",
    ];

    for (const key of folderKeys) {
      try {
        const folderName = key.replace(".folder", "").replace(/\./g, "_");
        folders[folderName] = Config.getFolderPath(key, createIfNotExists);
      } catch (error) {
        console.warn(
          `Could not resolve folder path for ${key}: ${error.message}`
        );
      }
    }

    return folders;
  }

  /**
   * Generate full file path with pattern replacement
   * @param {string} patternKey - Configuration key for file pattern
   * @param {string} folderKey - Configuration key for target folder
   * @param {Object} replacements - Object with replacement values
   * @returns {string} - Full file path
   */
  static generateFilePath(patternKey, folderKey, replacements = {}) {
    const pattern = Config.getProperty(patternKey);
    const folderPath = Config.getFolderPath(folderKey, true);

    if (!pattern) {
      throw new Error(`File pattern not found: ${patternKey}`);
    }

    let fileName = pattern;

    // Default replacements
    const now = new Date();
    const defaultReplacements = {
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(now.getDate()).padStart(2, "0")}`,
      timestamp: now.toISOString().replace(/[:.]/g, "-"),
      time: `${String(now.getHours()).padStart(2, "0")}-${String(
        now.getMinutes()
      ).padStart(2, "0")}`,
    };

    // Apply replacements
    const allReplacements = { ...defaultReplacements, ...replacements };
    for (const [key, value] of Object.entries(allReplacements)) {
      fileName = fileName.replace(new RegExp(`{${key}}`, "g"), value);
    }

    return path.join(folderPath, fileName);
  }

  /**
   * Locate the config.properties file
   * @returns {string} - Path to config file
   */
  static locateConfigFile() {
    const workingDir = process.cwd();
    const configFile = path.join(
      workingDir,
      "companyConfig",
      "config.properties"
    );

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
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (
        !trimmedLine ||
        trimmedLine.startsWith("#") ||
        trimmedLine.startsWith("//")
      ) {
        continue;
      }

      const separatorIndex = trimmedLine.indexOf("=");
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
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return pattern.replace("{date}", dateStr);
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
