// main.js
/**
 * ToolManager Application - JavaScript Version
 * CNC Tool Management System
 */
const config = require("./config");
const Logger = require("./utils/Logger");
const ExcelProcessor = require("./src/ExcelProcessor");
const ToolFactory = require("./src/ToolFactory");
const Matrix = require("./src/Matrix");
const ToolLogic = require("./src/ToolLogic");

async function main() {
  try {
    console.log("🚀 Starting ToolManager Application...");

    // Initialize configuration
    config.initialize();
    console.log("✓ Configuration loaded successfully");

    // Set up logging
    Logger.setupFileNaming();
    Logger.info("ToolManager Application started");

    // Create service instances
    const excelProcessor = ExcelProcessor; // Static class
    const toolFactory = new ToolFactory();
    const toolLogic = new ToolLogic();

    Logger.info("✓ Service instances created");

    // Check if we have a test Excel file to process
    const testFilePath = config.getPath("filesToProcess");
    const fs = require("fs");

    if (fs.existsSync(testFilePath)) {
      const files = fs
        .readdirSync(testFilePath)
        .filter((f) => config.isExcelFile(f));

      if (files.length > 0) {
        const excelFile = require("path").join(testFilePath, files[0]);

        Logger.info(`📊 Processing Excel file: ${excelFile}`);
        const processingResult = excelProcessor.processMainExcel(excelFile);

        if (!processingResult.success) {
          throw new Error(`Excel processing failed: ${processingResult.error}`);
        }

        Logger.info("✓ Excel file processed successfully");

        // For now, just show the results instead of uploading to Matrix
        console.log(
          `📊 Found ${
            Object.keys(processingResult.toolInventory).length
          } unique tools`
        );
        console.log(`📈 Summary:`, processingResult.summary);
      } else {
        console.log("📝 No Excel files found in test_data/filesToProcess/");
        console.log("💡 Copy an Excel file there to process it");
      }
    } // Upload tools from JSON to Matrix
    Logger.info("🔧 Uploading tools from JSON...");
    const uploadResult = toolFactory.uploadToolsFromJSON();

    if (!uploadResult.success) {
      throw new Error(`Tool upload failed: ${uploadResult.error}`);
    }

    Logger.info(
      `✓ Tools uploaded: ${uploadResult.toolsCreated} created, ${uploadResult.toolsUpdated} updated`
    );

    // Print all tools
    console.log("\n📋 Current Tool Matrix:");
    Logger.info("Printing all tools in matrix");
    Matrix.printAllTool();

    // Get and display statistics
    console.log("\n📊 Tool Statistics:");
    const summary = Matrix.getSummary();
    console.log(`Total Tools: ${summary.totalTools}`);
    console.log(`Free Tools: ${summary.freeTools}`);
    console.log(`In Use Tools: ${summary.inUseTools}`);
    console.log(`Maxed Tools: ${summary.maxedTools}`);
    console.log(`In Debt Tools: ${summary.inDebtTools}`);

    // Get utilization stats
    const utilizationStats = toolLogic.getToolUtilizationStats();
    console.log(
      `\n📈 Average Tool Utilization: ${utilizationStats.averageUtilization.toFixed(
        2
      )}%`
    );

    // Get maintenance recommendations
    const maintenanceRecommendations =
      toolLogic.getMaintenanceRecommendations();
    if (maintenanceRecommendations.length > 0) {
      console.log("\n🔧 Maintenance Recommendations:");
      maintenanceRecommendations.slice(0, 5).forEach((rec) => {
        console.log(
          `${rec.priority}: ${rec.action} - D${rec.tool.diameter} P${rec.tool.toolCode} (${rec.reason})`
        );
      });
    }

    Logger.info("ToolManager application completed successfully");
    console.log("\n✅ ToolManager Application completed successfully!");
  } catch (error) {
    Logger.error(`Application error: ${error.message}`);
    console.error("❌ Application failed:", error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  Logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  Logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

// Run the application
if (require.main === module) {
  main();
}

module.exports = { main };
