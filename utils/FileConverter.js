// src/utils/FileConverter.js
/**
 * File conversion utilities for Excel and JSON processing
 * Equivalent to Java FileConverter class
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Logger = require('./Logger');

class FileConverter {
  /**
   * Remove first five rows from Excel file and save to new location
   * @param {string} inputPath - Path to input Excel file
   * @param {string} outputPath - Path to output Excel file
   */
  static removeFirstFiveRows(inputPath, outputPath) {
    try {
      Logger.info(`Removing first 5 rows from: ${inputPath}`);
      
      // Read the Excel file
      const workbook = XLSX.readFile(inputPath);
      const sheetName = workbook.SheetNames[0]; // Get first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON to manipulate data
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Remove first 5 rows
      const modifiedData = jsonData.slice(5);
      
      // Create new worksheet from modified data
      const newWorksheet = XLSX.utils.aoa_to_sheet(modifiedData);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write the modified Excel file
      XLSX.writeFile(newWorkbook, outputPath);
      Logger.info(`Modified Excel file saved to: ${outputPath}`);
      
    } catch (error) {
      Logger.error(`Failed to remove rows from Excel file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert Excel file to JSON
   * @param {string} excelPath - Path to Excel file
   * @param {string} jsonPath - Path to output JSON file
   */
  static XLSXToJsonConverter(excelPath, jsonPath) {
    try {
      Logger.info(`Converting Excel to JSON: ${excelPath} -> ${jsonPath}`);
      
      // Read the Excel file
      const workbook = XLSX.readFile(excelPath);
      const sheetName = workbook.SheetNames[0]; // Get first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Ensure output directory exists
      const outputDir = path.dirname(jsonPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write JSON file
      fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
      Logger.info(`JSON file saved to: ${jsonPath}`);
      
    } catch (error) {
      Logger.error(`Failed to convert Excel to JSON: ${error.message}`);
      throw error;
    }
  }

  /**
   * Convert JSON file to Excel
   * @param {string} jsonPath - Path to JSON file
   * @param {string} excelPath - Path to output Excel file
   */
  static jsonToXLSXConverter(jsonPath, excelPath) {
    try {
      Logger.info(`Converting JSON to Excel: ${jsonPath} -> ${excelPath}`);
      
      // Read JSON file
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Create worksheet from JSON data
      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      // Ensure output directory exists
      const outputDir = path.dirname(excelPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write Excel file
      XLSX.writeFile(workbook, excelPath);
      Logger.info(`Excel file saved to: ${excelPath}`);
      
    } catch (error) {
      Logger.error(`Failed to convert JSON to Excel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Read JSON data from file
   * @param {string} jsonPath - Path to JSON file
   * @returns {Array|Object} - Parsed JSON data
   */
  static readJsonFile(jsonPath) {
    try {
      const content = fs.readFileSync(jsonPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      Logger.error(`Failed to read JSON file ${jsonPath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Write JSON data to file
   * @param {string} jsonPath - Path to JSON file
   * @param {Array|Object} data - Data to write
   */
  static writeJsonFile(jsonPath, data) {
    try {
      const outputDir = path.dirname(jsonPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      Logger.info(`JSON file written to: ${jsonPath}`);
    } catch (error) {
      Logger.error(`Failed to write JSON file ${jsonPath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to check
   * @returns {boolean} - True if file exists
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }
}

module.exports = FileConverter;