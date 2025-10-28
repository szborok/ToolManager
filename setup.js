// setup.js
/**
 * Setup script to ensure all required directories exist
 * and verify the application configuration
 */

const Config = require("./utils/Config");
const fs = require("fs");
const path = require("path");

function main() {
  console.log("🔧 Setting up ToolManager directories...");

  try {
    // Initialize configuration
    Config.initialize();

    // Get all folder paths and create them
    const folders = Config.getAllFolderPaths(true); // true = create if not exists

    console.log("\n📁 Directory Setup:");
    for (const [name, path] of Object.entries(folders)) {
      const exists = fs.existsSync(path);
      console.log(`  ${exists ? "✓" : "✗"} ${name}: ${path}`);
    }

    // Check for configuration files
    console.log("\n📄 Configuration Files:");

    const configFiles = ["tool.definitions.file", "company.config.file"];

    for (const fileKey of configFiles) {
      try {
        const filePath = Config.getFilePath(fileKey);
        const exists = fs.existsSync(filePath);
        console.log(`  ${exists ? "✓" : "✗"} ${fileKey}: ${filePath}`);
      } catch (error) {
        console.log(`  ✗ ${fileKey}: ${error.message}`);
      }
    }

    // Display current configuration summary
    console.log("\n⚙️  Configuration Summary:");
    const properties = Config.getAllProperties();
    const importantKeys = [
      "planning.days.ahead",
      "tool.categories.enabled",
      "work.tracking.enabled",
      "file.watcher.enabled",
      "app.environment",
    ];

    for (const key of importantKeys) {
      const value = properties.get(key) || "not set";
      console.log(`  ${key}: ${value}`);
    }

    console.log("\n✅ Setup completed successfully!");
    console.log("\n🚀 Next steps:");
    console.log('  1. Run "npm start" to test the main application');
    console.log(
      '  2. Drop matrix files into filesToProcess/ and run "npm run daily"'
    );
    console.log('  3. Use "npm run daily-watch" for automatic file processing');
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
