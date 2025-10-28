// src/services/FileProcessor.js
/**
 * File processing service
 * Equivalent to Java FileProcessor class
 */
const fs = require('fs');
const Constants = require('../utils/Constants');
const FileConverter = require('../utils/FileConverter');
const Logger = require('../utils/Logger');

class FileProcessor {
  /**
   * Process matrix XLSX file - remove first 5 rows and convert to JSON
   */
  processMatrixXLSXFile() {
    try {
      Logger.info('Starting matrix XLSX file processing...');
      
      const originalXLSX = Constants.Paths.MATRIX_ORIGINAL_FILE;
      const fixedXLSX = Constants.Paths.MATRIX_FIXED_FILE;
      const resultJSON = Constants.Paths.MATRIX_JSON_FILE;

      // Check if input file exists
      if (!fs.existsSync(originalXLSX)) {
        const errorMsg = `Input file does not exist: ${originalXLSX}`;
        Logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      Logger.info(`Processing file: ${originalXLSX}`);
      Logger.info(`Output XLSX: ${fixedXLSX}`);
      Logger.info(`Output JSON: ${resultJSON}`);

      // Remove the first five rows from the Excel file and save it
      FileConverter.removeFirstFiveRows(originalXLSX, fixedXLSX);
      
      // Convert the modified Excel file to JSON
      FileConverter.XLSXToJsonConverter(fixedXLSX, resultJSON);
      
      Logger.info('Matrix XLSX file processing completed successfully');
      
      return {
        success: true,
        originalFile: originalXLSX,
        fixedFile: fixedXLSX,
        jsonFile: resultJSON
      };
      
    } catch (error) {
      Logger.error(`Matrix XLSX processing failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate input file exists and is accessible
   * @param {string} filePath - Path to validate
   * @returns {boolean} - True if file is valid
   */
  validateInputFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        Logger.error(`File does not exist: ${filePath}`);
        return false;
      }

      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        Logger.error(`Path is not a file: ${filePath}`);
        return false;
      }

      // Check if file is readable
      fs.accessSync(filePath, fs.constants.R_OK);
      return true;
      
    } catch (error) {
      Logger.error(`File validation failed for ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Ensure output directories exist
   * @param {string} filePath - File path to ensure directory for
   */
  ensureOutputDirectory(filePath) {
    const dir = require('path').dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      Logger.info(`Created output directory: ${dir}`);
    }
  }

  /**
   * Get file processing status
   * @returns {Object} - Status information
   */
  getProcessingStatus() {
    const originalFile = Constants.Paths.MATRIX_ORIGINAL_FILE;
    const fixedFile = Constants.Paths.MATRIX_FIXED_FILE;
    const jsonFile = Constants.Paths.MATRIX_JSON_FILE;

    return {
      originalExists: fs.existsSync(originalFile),
      fixedExists: fs.existsSync(fixedFile),
      jsonExists: fs.existsSync(jsonFile),
      paths: {
        original: originalFile,
        fixed: fixedFile,
        json: jsonFile
      }
    };
  }

  /**
   * Clean up processed files
   * @param {boolean} keepOriginal - Whether to keep the original file
   */
  cleanupProcessedFiles(keepOriginal = true) {
    try {
      const fixedFile = Constants.Paths.MATRIX_FIXED_FILE;
      const jsonFile = Constants.Paths.MATRIX_JSON_FILE;
      const originalFile = Constants.Paths.MATRIX_ORIGINAL_FILE;

      if (fs.existsSync(fixedFile)) {
        fs.unlinkSync(fixedFile);
        Logger.info(`Deleted fixed file: ${fixedFile}`);
      }

      if (fs.existsSync(jsonFile)) {
        fs.unlinkSync(jsonFile);
        Logger.info(`Deleted JSON file: ${jsonFile}`);
      }

      if (!keepOriginal && fs.existsSync(originalFile)) {
        fs.unlinkSync(originalFile);
        Logger.info(`Deleted original file: ${originalFile}`);
      }

      Logger.info('Cleanup completed');
      
    } catch (error) {
      Logger.error(`Cleanup failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = FileProcessor;