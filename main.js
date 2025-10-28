// main.js
/**
 * ToolManager Application - JavaScript Version
 * CNC Tool Management System
 */
const Config = require('./src/utils/Config');
const Logger = require('./src/utils/Logger');
const FileProcessor = require('./src/services/FileProcessor');
const ToolFactory = require('./src/factories/ToolFactory');
const Matrix = require('./src/models/Matrix');
const ToolLogic = require('./src/services/ToolLogic');

async function main() {
  try {
    console.log('🚀 Starting ToolManager Application...');
    
    // Initialize configuration
    Config.initialize();
    console.log('✓ Configuration loaded successfully');

    // Set up logging
    Logger.setupFileNaming();
    Logger.info('ToolManager Application started');

    // Create service instances
    const fileProcessor = new FileProcessor();
    const toolFactory = new ToolFactory();
    const toolLogic = new ToolLogic();

    Logger.info('✓ Service instances created');

    // Process Excel file and convert to JSON
    Logger.info('📊 Processing matrix XLSX file...');
    const processingResult = fileProcessor.processMatrixXLSXFile();
    
    if (!processingResult.success) {
      throw new Error(`File processing failed: ${processingResult.error}`);
    }
    
    Logger.info('✓ Excel file processed and converted to JSON');

    // Upload tools from JSON to Matrix
    Logger.info('🔧 Uploading tools from JSON...');
    const uploadResult = toolFactory.uploadToolsFromJSON();
    
    if (!uploadResult.success) {
      throw new Error(`Tool upload failed: ${uploadResult.error}`);
    }
    
    Logger.info(`✓ Tools uploaded: ${uploadResult.toolsCreated} created, ${uploadResult.toolsUpdated} updated`);

    // Print all tools
    console.log('\n📋 Current Tool Matrix:');
    Logger.info('Printing all tools in matrix');
    Matrix.printAllTool();

    // Get and display statistics
    console.log('\n📊 Tool Statistics:');
    const summary = Matrix.getSummary();
    console.log(`Total Tools: ${summary.totalTools}`);
    console.log(`Free Tools: ${summary.freeTools}`);
    console.log(`In Use Tools: ${summary.inUseTools}`);
    console.log(`Maxed Tools: ${summary.maxedTools}`);
    console.log(`In Debt Tools: ${summary.inDebtTools}`);

    // Get utilization stats
    const utilizationStats = toolLogic.getToolUtilizationStats();
    console.log(`\n📈 Average Tool Utilization: ${utilizationStats.averageUtilization.toFixed(2)}%`);

    // Get maintenance recommendations
    const maintenanceRecommendations = toolLogic.getMaintenanceRecommendations();
    if (maintenanceRecommendations.length > 0) {
      console.log('\n🔧 Maintenance Recommendations:');
      maintenanceRecommendations.slice(0, 5).forEach(rec => {
        console.log(`${rec.priority}: ${rec.action} - D${rec.tool.diameter} P${rec.tool.toolCode} (${rec.reason})`);
      });
    }

    Logger.info('ToolManager application completed successfully');
    console.log('\n✅ ToolManager Application completed successfully!');

  } catch (error) {
    Logger.error(`Application error: ${error.message}`);
    console.error('❌ Application failed:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  Logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  Logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

// Run the application
if (require.main === module) {
  main();
}

module.exports = { main };