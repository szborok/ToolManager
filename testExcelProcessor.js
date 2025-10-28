// testExcelProcessor.js
/**
 * Test script for the Excel processor
 */
const ExcelProcessor = require('./src/services/ExcelProcessor');
const Logger = require('./src/utils/Logger');
const path = require('path');

function main() {
  // Initialize logger
  Logger.setupFileNaming();
  
  console.log('🔧 Testing Excel Processor...');
  console.log('==========================================');
  
  const mainExcelPath = path.join(__dirname, 'filesToProcess', 'Euroform_Matrix_2024-11-21.xlsx');
  const outputPath = path.join(__dirname, 'analysis', 'processed_inventory.json');
  
  try {
    // Process the Excel file
    const result = ExcelProcessor.processMainExcel(mainExcelPath);
    
    if (result.success) {
      console.log('✅ Excel processing successful!');
      console.log('\n📊 Summary:');
      console.log(`- Total unique tools: ${result.summary.totalUniqueTools}`);
      console.log(`- Total quantity: ${result.summary.totalQuantity}`);
      console.log(`- Average per tool: ${result.summary.averageQuantityPerTool}`);
      
      console.log('\n🔝 Top 10 tools by quantity:');
      result.summary.topTools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.code}: ${tool.quantity} pieces`);
      });
      
      // Save to JSON file
      ExcelProcessor.saveInventoryToJson(result, outputPath);
      
      console.log('\n📝 Sample tool inventory:');
      const sampleTools = Object.entries(result.toolInventory).slice(0, 10);
      sampleTools.forEach(([code, quantity]) => {
        console.log(`  ${code}: ${quantity}`);
      });
      
    } else {
      console.error('❌ Excel processing failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();