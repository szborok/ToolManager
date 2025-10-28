// src/utils/Constants.js
/**
 * Constants for file paths and configuration
 * Equivalent to Java Constants class
 */
const path = require('path');
const Config = require('./Config');

class Constants {
  /**
   * Folder constants
   */
  static Folders = {
    FILES_TO_PROCESS_FOLDER: Config.getProperty('files.to.process.folder', 'filesToProcess'),
    FILES_PROCESSED_FOLDER: Config.getProperty('files.processed.folder', 'filesProcessedArchive'),
    LOG_FOLDER: Config.getProperty('log.folder', 'logs')
  };

  /**
   * File name constants with dynamic date generation
   */
  static FileNames = {
    get MATRIX_ORIGINAL_FILE_NAME() {
      return Config.generateFileName(Config.getProperty('matrix.original.file.name.pattern', 'Euroform_Matrix_{date}.xlsx'));
    },
    get MATRIX_FIXED_FILE_NAME() {
      return Config.generateFileName(Config.getProperty('matrix.fixed.file.name.pattern', 'Euroform_Matrix_FIXED_{date}.xlsx'));
    },
    get MATRIX_JSON_FILE_NAME() {
      return Config.generateFileName(Config.getProperty('matrix.json.file.name.pattern', 'Euroform_Matrix_JSON_{date}.json'));
    }
  };

  /**
   * Full path constants
   */
  static Paths = {
    get MATRIX_ORIGINAL_FILE() {
      return Constants.constructFilePath(Constants.Folders.FILES_TO_PROCESS_FOLDER, Constants.FileNames.MATRIX_ORIGINAL_FILE_NAME);
    },
    get MATRIX_FIXED_FILE() {
      return Constants.constructFilePath(Constants.Folders.FILES_PROCESSED_FOLDER, Constants.FileNames.MATRIX_FIXED_FILE_NAME);
    },
    get MATRIX_JSON_FILE() {
      return Constants.constructFilePath(Constants.Folders.FILES_PROCESSED_FOLDER, Constants.FileNames.MATRIX_JSON_FILE_NAME);
    }
  };

  /**
   * Utility method to construct full file paths
   * @param {string} folder - Folder path
   * @param {string} fileName - File name
   * @returns {string} - Complete file path
   */
  static constructFilePath(folder, fileName) {
    return path.join(folder, fileName);
  }
}

module.exports = Constants;