// utils/ExcelAnalyzer.js
/**
 * Excel file analyzer to understand the structure and content
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelAnalyzer {
  /**
   * Analyze the main Excel file structure
   * @param {string} filePath - Path to Excel file
   */
  static analyzeMainExcel(filePath) {
    try {
      console.log(`\n📊 Analyzing Excel file: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      
      console.log(`\n📋 Worksheets found: ${workbook.SheetNames.length}`);
      
      // Analyze each worksheet
      workbook.SheetNames.forEach((sheetName, index) => {
        console.log(`\n--- Sheet ${index + 1}: "${sheetName}" ---`);
        
        const worksheet = workbook.Sheets[sheetName];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        
        console.log(`Range: ${XLSX.utils.encode_range(range)} (${range.e.r + 1} rows, ${range.e.c + 1} columns)`);
        
        // Show first 10 rows to understand structure
        this.showSheetPreview(worksheet, sheetName, 10);
      });
      
    } catch (error) {
      console.error(`❌ Error analyzing Excel file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Show preview of worksheet data
   * @param {Object} worksheet - XLSX worksheet object
   * @param {string} sheetName - Name of the sheet
   * @param {number} rowLimit - Number of rows to show
   */
  static showSheetPreview(worksheet, sheetName, rowLimit = 5) {
    try {
      // Convert to JSON to see the data structure
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,  // Use array of arrays format
        range: 0,   // Start from row 0
        defval: ''  // Default value for empty cells
      });
      
      console.log(`\nFirst ${Math.min(rowLimit, jsonData.length)} rows:`);
      
      jsonData.slice(0, rowLimit).forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row.slice(0, 10)); // Show first 10 columns
      });
      
      // Also try to get with headers
      if (jsonData.length > 1) {
        console.log(`\nTrying to parse with headers (first row as headers):`);
        const jsonWithHeaders = XLSX.utils.sheet_to_json(worksheet, { range: 1 });
        
        if (jsonWithHeaders.length > 0) {
          console.log('Headers detected:', Object.keys(jsonWithHeaders[0]));
          console.log('Sample record:', jsonWithHeaders[0]);
        }
      }
      
    } catch (error) {
      console.log(`Could not preview sheet "${sheetName}": ${error.message}`);
    }
  }

  /**
   * Find potential tool-related columns
   * @param {string} filePath - Path to Excel file
   */
  static findToolColumns(filePath) {
    try {
      console.log(`\n🔍 Looking for tool-related columns...`);
      
      const workbook = XLSX.readFile(filePath);
      const toolKeywords = [
        'tool', 'szerszám', 'diameter', 'átmérő', 'code', 'kód', 
        'type', 'típus', 'name', 'név', 'quantity', 'mennyiség',
        'stock', 'készlet', 'available', 'elérhető'
      ];
      
      workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Analyzing "${sheetName}" for tool columns ---`);
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0];
          const potentialToolColumns = [];
          
          headers.forEach((header, index) => {
            if (header && typeof header === 'string') {
              const headerLower = header.toLowerCase();
              const isToolRelated = toolKeywords.some(keyword => 
                headerLower.includes(keyword.toLowerCase())
              );
              
              if (isToolRelated) {
                potentialToolColumns.push({
                  index,
                  name: header,
                  sampleData: jsonData.slice(1, 6).map(row => row[index])
                });
              }
            }
          });
          
          if (potentialToolColumns.length > 0) {
            console.log('Potential tool-related columns:');
            potentialToolColumns.forEach(col => {
              console.log(`  - Column ${col.index + 1}: "${col.name}"`);
              console.log(`    Sample data: ${col.sampleData.join(', ')}`);
            });
          } else {
            console.log('No obvious tool-related columns found');
          }
        }
      });
      
    } catch (error) {
      console.error(`❌ Error finding tool columns: ${error.message}`);
    }
  }

  /**
   * Export sheet data to JSON for easier analysis
   * @param {string} filePath - Path to Excel file
   * @param {string} outputDir - Directory to save JSON files
   */
  static exportToJson(filePath, outputDir = './analysis') {
    try {
      console.log(`\n💾 Exporting Excel sheets to JSON...`);
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const workbook = XLSX.readFile(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const outputFile = path.join(outputDir, `${fileName}_${sheetName}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
        
        console.log(`✓ Exported "${sheetName}" to ${outputFile}`);
      });
      
    } catch (error) {
      console.error(`❌ Error exporting to JSON: ${error.message}`);
    }
  }
}

module.exports = ExcelAnalyzer;