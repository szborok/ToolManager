// setup.js// setup.js

/**/**

 * Setup script to ensure all required directories exist * Setup script to ensure all required directories exist

 * and verify the application configuration * and verify the application configuration

 */ */



const fs = require("fs");const Config = require("./utils/Config");

const path = require("path");const fs = require("fs");

const config = require("./config");const path = require("path");



async function run() {function main() {

  console.log("🔧 Setting up ToolManager directories...");  console.log("🔧 Setting up ToolManager directories...");



  try {  try {

    // Initialize configuration if needed    // Initialize configuration

    if (typeof config.initialize === 'function') {    Config.initialize();

      config.initialize();

    }    // Get all folder paths and create them

    const folders = Config.getAllFolderPaths(true); // true = create if not exists

    // Ensure required directories exist

    const requiredDirs = [    console.log("\n📁 Directory Setup:");

      config.paths.test.filesToProcess,    for (const [name, path] of Object.entries(folders)) {

      config.paths.test.workTracking,      const exists = fs.existsSync(path);

      config.paths.test.archive,      console.log(`  ${exists ? "✓" : "✗"} ${name}: ${path}`);

      config.paths.test.logs,    }

      path.join(__dirname, "test_data", "analysis")

    ];    // Check for configuration files

    console.log("\n📄 Configuration Files:");

    console.log("\n📁 Directory Setup:");

    for (const dir of requiredDirs) {    const configFiles = ["tool.definitions.file", "company.config.file"];

      try {

        if (!fs.existsSync(dir)) {    for (const fileKey of configFiles) {

          fs.mkdirSync(dir, { recursive: true });      try {

          console.log(`  ✓ Created: ${dir}`);        const filePath = Config.getFilePath(fileKey);

        } else {        const exists = fs.existsSync(filePath);

          console.log(`  ✓ Exists: ${dir}`);        console.log(`  ${exists ? "✓" : "✗"} ${fileKey}: ${filePath}`);

        }      } catch (error) {

      } catch (err) {        console.log(`  ✗ ${fileKey}: ${error.message}`);

        console.log(`  ✗ Failed to create: ${dir} - ${err.message}`);      }

      }    }

    }

    // Display current configuration summary

    // Check for configuration files    console.log("\n⚙️  Configuration Summary:");

    console.log("\n📄 Configuration Files:");    const properties = Config.getAllProperties();

    const configFiles = [    const importantKeys = [

      { name: "Main Config", path: path.join(__dirname, "config.js") },      "planning.days.ahead",

      { name: "Company Config", path: path.join(__dirname, "companyConfig", "config.properties") },      "tool.categories.enabled",

      { name: "Tool Definitions", path: path.join(__dirname, "companyConfig", "ToolDefinitions.txt") }      "work.tracking.enabled",

    ];      "file.watcher.enabled",

      "app.environment",

    for (const file of configFiles) {    ];

      const exists = fs.existsSync(file.path);

      console.log(`  ${exists ? "✓" : "✗"} ${file.name}: ${file.path}`);    for (const key of importantKeys) {

    }      const value = properties.get(key) || "not set";

      console.log(`  ${key}: ${value}`);

    console.log("\n🎉 Setup completed!");    }



  } catch (error) {    console.log("\n✅ Setup completed successfully!");

    console.error(`❌ Setup failed: ${error.message}`);    console.log("\n🚀 Next steps:");

    process.exit(1);    console.log('  1. Run "npm start" to test the main application');

  }    console.log(

}      '  2. Drop matrix files into filesToProcess/ and run "npm run daily"'

    );

// Run setup if called directly    console.log('  3. Use "npm run daily-watch" for automatic file processing');

if (require.main === module) {  } catch (error) {

  run();    console.error("❌ Setup failed:", error.message);

}    process.exit(1);

  }

module.exports = { run };}

if (require.main === module) {
  main();
}

module.exports = { main };
