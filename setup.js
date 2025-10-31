// setup.js// setup.js// setup.js// setup.js

const fs = require("fs");

const path = require("path");const fs = require("fs");

const config = require("./config");

const path = require("path");

async function run() {

  console.log("🔧 Setting up ToolManager directories...");const config = require("./config");



  try {/**/**

    if (typeof config.initialize === 'function') {

      config.initialize();async function run() {

    }

  console.log("🔧 Setting up ToolManager directories..."); * Setup script to ensure all required directories exist * Setup script to ensure all required directories exist

    const createDirectory = (dirPath, description) => {

      if (!fs.existsSync(dirPath)) {

        fs.mkdirSync(dirPath, { recursive: true });

        console.log(`✅ Created ${description}: ${dirPath}`);  try { * and verify the application configuration * and verify the application configuration

      } else {

        console.log(`✓ ${description} exists: ${dirPath}`);    if (typeof config.initialize === 'function') {

      }

    };      config.initialize(); */ */



    if (config.app.testMode) {    }

      console.log("\n📁 Setting up TEST mode directories:");

      createDirectory(config.paths.test.filesToProcess, "Files to process directory");

      createDirectory(config.paths.test.filesProcessed, "Processed files archive");

      createDirectory(config.paths.test.workTracking, "Work tracking directory");    const createDirectory = (dirPath, description) => {

      createDirectory(config.paths.test.archive, "Archive directory");

      createDirectory(config.paths.test.analysis, "Analysis results directory");      if (!fs.existsSync(dirPath)) {const fs = require("fs");const fs = require("fs");

    } else {

      console.log("\n📁 Setting up PRODUCTION mode directories:");        fs.mkdirSync(dirPath, { recursive: true });

      createDirectory(config.paths.production.filesToProcess, "Files to process directory");

      createDirectory(config.paths.production.filesProcessed, "Processed files archive");        console.log(`✅ Created ${description}: ${dirPath}`);const path = require("path");const path = require("path");

      createDirectory(config.paths.production.workTracking, "Work tracking directory");

      createDirectory(config.paths.production.archive, "Archive directory");      } else {

      createDirectory(config.paths.production.analysis, "Analysis results directory");

    }        console.log(`✓ ${description} exists: ${dirPath}`);const config = require("./config");const config = require("./config");



    const logsDir = path.join(__dirname, 'logs');      }

    createDirectory(logsDir, "Logs directory");

    };

    const dataDir = path.join(__dirname, 'data');

    createDirectory(dataDir, "Data storage directory");



    console.log("\n✅ ToolManager setup completed successfully!");    if (config.app.testMode) {async function run() {async function run() {

    console.log(`📊 Storage type: ${config.storage.type}`);

          console.log("\n📁 Setting up TEST mode directories:");

    console.log("\n📦 Testing storage connection...");

    const DataManager = require('./src/DataManager');      createDirectory(config.paths.test.filesToProcess, "Files to process directory");  console.log("🔧 Setting up ToolManager directories...");  console.log("🔧 Setting up ToolManager directories...");

    const dataManager = new DataManager();

    await dataManager.initialize();      createDirectory(config.paths.test.filesProcessed, "Processed files archive");

    

    const health = await dataManager.healthCheck();      createDirectory(config.paths.test.workTracking, "Work tracking directory");

    console.log(`✅ Storage healthy: ${health.status} (${health.type})`);

          createDirectory(config.paths.test.archive, "Archive directory");

    await dataManager.disconnect();

      createDirectory(config.paths.test.analysis, "Analysis results directory");  try {  try {

  } catch (error) {

    console.error(`❌ Setup failed: ${error.message}`);    } else {

    process.exit(1);

  }      console.log("\n📁 Setting up PRODUCTION mode directories:");    // Initialize configuration if needed    // Initialize configuration if needed

}

      createDirectory(config.paths.production.filesToProcess, "Files to process directory");

module.exports = { run };

      createDirectory(config.paths.production.filesProcessed, "Processed files archive");    if (typeof config.initialize === 'function') {    if (typeof config.initialize === 'function') {

if (require.main === module) {

  run();      createDirectory(config.paths.production.workTracking, "Work tracking directory");

}
      createDirectory(config.paths.production.archive, "Archive directory");      config.initialize();      config.initialize();

      createDirectory(config.paths.production.analysis, "Analysis results directory");

    }    }    }



    const logsDir = path.join(__dirname, 'logs');

    createDirectory(logsDir, "Logs directory");

    const createDirectory = (dirPath, description) => {    const createDirectory = (dirPath, description) => {

    const dataDir = path.join(__dirname, 'data');

    createDirectory(dataDir, "Data storage directory");      if (!fs.existsSync(dirPath)) {      if (!fs.existsSync(dirPath)) {



    console.log("\n✅ ToolManager setup completed successfully!");        fs.mkdirSync(dirPath, { recursive: true });        fs.mkdirSync(dirPath, { recursive: true });

    console.log(`📊 Storage type: ${config.storage.type}`);

            console.log(`✅ Created ${description}: ${dirPath}`);        console.log(`✅ Created ${description}: ${dirPath}`);

    console.log("\n📦 Testing storage connection...");

    const DataManager = require('./src/DataManager');      } else {      } else {

    const dataManager = new DataManager();

    await dataManager.initialize();        console.log(`✓ ${description} exists: ${dirPath}`);        console.log(`✓ ${description} exists: ${dirPath}`);

    

    const health = await dataManager.healthCheck();      }      }

    console.log(`✅ Storage healthy: ${health.status} (${health.type})`);

        };    };

    await dataManager.disconnect();



  } catch (error) {

    console.error(`❌ Setup failed: ${error.message}`);    // Create test mode directories    // Create test mode directories

    process.exit(1);

  }    if (config.app.testMode) {    if (config.app.testMode) {

}

      console.log("\n📁 Setting up TEST mode directories:");      console.log("\n📁 Setting up TEST mode directories:");

module.exports = { run };

            

if (require.main === module) {

  run();      createDirectory(config.paths.test.filesToProcess, "Files to process directory");      createDirectory(config.paths.test.filesToProcess, "Files to process directory");

}
      createDirectory(config.paths.test.filesProcessed, "Processed files archive");      createDirectory(config.paths.test.filesProcessed, "Processed files archive");

      createDirectory(config.paths.test.workTracking, "Work tracking directory");      createDirectory(config.paths.test.workTracking, "Work tracking directory");

      createDirectory(config.paths.test.archive, "Archive directory");      createDirectory(config.paths.test.archive, "Archive directory");

      createDirectory(config.paths.test.analysis, "Analysis results directory");      createDirectory(config.paths.test.analysis, "Analysis results directory");

            

      // Check required test data directories exist      // Check required test data directories exist

      if (!fs.existsSync(config.paths.test.testDataPath)) {      if (!fs.existsSync(config.paths.test.testDataPath)) {

        console.log(`⚠️  Test data directory missing: ${config.paths.test.testDataPath}`);        console.log(`⚠️  Test data directory missing: ${config.paths.test.testDataPath}`);

      } else {      } else {

        console.log(`✓ Test data directory exists: ${config.paths.test.testDataPath}`);        console.log(`✓ Test data directory exists: ${config.paths.test.testDataPath}`);

      }      }

    } else {    } else {

      console.log("\n📁 Setting up PRODUCTION mode directories:");      console.log("\n� Setting up PRODUCTION mode directories:");

            

      createDirectory(config.paths.production.filesToProcess, "Files to process directory");      createDirectory(config.paths.production.filesToProcess, "Files to process directory");

      createDirectory(config.paths.production.filesProcessed, "Processed files archive");      createDirectory(config.paths.production.filesProcessed, "Processed files archive");

      createDirectory(config.paths.production.workTracking, "Work tracking directory");      createDirectory(config.paths.production.workTracking, "Work tracking directory");

      createDirectory(config.paths.production.archive, "Archive directory");      createDirectory(config.paths.production.archive, "Archive directory");

      createDirectory(config.paths.production.analysis, "Analysis results directory");      createDirectory(config.paths.production.analysis, "Analysis results directory");

    }    }



    // Create logs directory    // Create logs directory

    const logsDir = path.join(__dirname, 'logs');    const logsDir = path.join(__dirname, 'logs');

    createDirectory(logsDir, "Logs directory");    createDirectory(logsDir, "Logs directory");



    // Create data directory for storage adapter    // Create data directory for storage adapter

    const dataDir = path.join(__dirname, 'data');    const dataDir = path.join(__dirname, 'data');

    createDirectory(dataDir, "Data storage directory");    createDirectory(dataDir, "Data storage directory");



    console.log("\n✅ ToolManager setup completed successfully!");    console.log("\n✅ ToolManager setup completed successfully!");

    console.log(`📊 Storage type: ${config.storage.type}`);    console.log(`📊 Storage type: ${config.storage.type}`);

    console.log(`🔄 Mode: ${config.app.testMode ? 'TEST' : 'PRODUCTION'}`);    console.log(`🔄 Mode: ${config.app.testMode ? 'TEST' : 'PRODUCTION'}`);

        

    // Test storage initialization    // Test storage initialization

    console.log("\n📦 Testing storage connection...");    console.log("\n📦 Testing storage connection...");

    const DataManager = require('./src/DataManager');    const DataManager = require('./src/DataManager');

    const dataManager = new DataManager();    const dataManager = new DataManager();

    await dataManager.initialize();    await dataManager.initialize();

        

    const health = await dataManager.healthCheck();    const health = await dataManager.healthCheck();

    console.log(`✅ Storage healthy: ${health.status} (${health.type})`);    console.log(`✅ Storage healthy: ${health.status} (${health.type})`);

        

    await dataManager.disconnect();    await dataManager.disconnect();



  } catch (error) {  } catch (error) {

    console.error(`❌ Setup failed: ${error.message}`);    console.error(`❌ Setup failed: ${error.message}`);

    process.exit(1);    process.exit(1);

  }  }

}}



// Export for use by main.js// Export for use by main.js

module.exports = { run };module.exports = { run };



// Allow direct execution// Allow direct execution

if (require.main === module) {if (require.main === module) {

  run();  run();

}}

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
