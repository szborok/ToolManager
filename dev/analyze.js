// analyze.js
/**
 * Simple script to analyze the main Excel file
 */
const ExcelAnalyzer = require('./utils/ExcelAnalyzer');
const path = require('path');

function main() {
  const mainExcelPath = path.join(__dirname, 'filesToProcess', 'Euroform_Matrix_2024-11-21.xlsx');
  
  console.log('🔍 Starting Excel Analysis...');
  console.log('==========================================');
  
  try {
    // Analyze the main Excel file structure
    ExcelAnalyzer.analyzeMainExcel(mainExcelPath);
    
    // Look for tool-related columns
    ExcelAnalyzer.findToolColumns(mainExcelPath);
    
    // Export to JSON for easier examination
    ExcelAnalyzer.exportToJson(mainExcelPath, './analysis');
    
    console.log('\n✅ Analysis complete!');
    console.log('Check the ./analysis folder for JSON exports');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

main();