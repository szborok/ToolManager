# ToolManager - CNC Tool Management System

A sophisticated CNC Tool Management System for tracking and managing manufacturing tools with organized temporary file processing and cross-platform compatibility.

## 🚀 Overview

ToolManager is designed to process Excel inventory files and JSON tool usage data to provide comprehensive tool analysis and reporting. It features complete read-only processing using an organized temporary file structure for maximum data safety.

### Key Features

- **📊 Excel Processing**: Automated Excel inventory file processing
- **🔍 JSON Analysis**: Tool usage analysis from manufacturing JSON files
- **🔐 Complete Data Safety**: Read-only processing with organized temp structure
- **🗂️ Professional Organization**: "BRK CNC Management Dashboard" temp hierarchy
- **🌍 Cross-Platform**: Works on Windows, macOS, and Linux
- **📈 Comprehensive Reporting**: Detailed tool analysis and utilization reports
- **⚡ Automated Workflow**: Streamlined processing pipeline
- **🧹 Clean Operations**: Automatic cleanup of organized temp sessions

## ⚠️ Security Notice

This application uses the `xlsx` library which has known security vulnerabilities. This is acceptable for our use case because:

- We only process trusted Excel files from known sources
- Files are processed in an isolated environment
- No user-uploaded files are processed directly
- The application is for internal manufacturing use only

No alternative library provides the same Excel reading capabilities required for our matrix file processing.

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the organized temp demo:**

   ```bash
   node demo-temp-organized.js
   ```

3. **Run the main application:**

   ```bash
   node main.js
   ```

## 📁 Project Structure

```
ToolManager/
├── main.js                    # Main application entry point
├── demo-temp-organized.js     # Demo for organized temp structure
├── setup.js                   # Setup and verification script
├── src/                       # Source code
│   ├── Analyzer.js           # Tool usage analysis
│   ├── DataManager.js        # Data management operations
│   ├── Executor.js           # Main orchestration logic
│   ├── ExcelProcessor.js     # Excel file processing
│   ├── Matrix.js             # Matrix data handling
│   ├── Project.js            # Project data model
│   ├── Results.js            # Result file management
│   ├── Scanner.js            # File scanning and discovery
│   ├── Tool.js               # Tool data model
│   ├── ToolFactory.js        # Tool object creation
│   └── ToolLogic.js          # Tool business logic
├── utils/                     # Utility modules
│   ├── CleanupService.js     # Cleanup operations
│   ├── TempFileManager.js    # Organized temp file management
│   └── Logger.js             # Logging infrastructure
├── config.js                  # Application configuration
├── test_data/                # Test data
│   └── E-Cut,MFC,XF,XFeed készlet.xlsx  # Sample Excel file
├── logs/                     # Application logs
└── temp/                     # Legacy temp folder (replaced by organized structure)
```

## � Organized Temp Structure

ToolManager uses a professional organized temporary file structure for complete data safety and cross-platform compatibility:

### Organized Temp Hierarchy

```
[OS Temp Directory]/BRK CNC Management Dashboard/
└── ToolManager/
    └── session_[timestamp]_[id]/
        ├── input_files/     # Original JSON files copied here
        ├── processed_files/ # Sanitized JSON files
        ├── results/         # Analysis results & reports
        └── excel_files/     # Excel inventory files
```

### How It Works

1. **Auto OS Detection**: Uses `os.tmpdir()` to automatically detect the correct temp directory:

   - **macOS**: `/var/folders/.../T/` or `/tmp/`
   - **Windows**: `C:\Users\[Username]\AppData\Local\Temp\`
   - **Linux**: `/tmp/`

2. **Professional Organization**: Creates "BRK CNC Management Dashboard" main folder with app-specific subfolders

3. **Session Management**: Each processing run gets a unique session directory

4. **File Type Organization**: Excel files, JSON files, and results are organized separately

5. **Safe Processing**: All analysis occurs on organized temp copies, never touching originals

6. **Automatic Cleanup**: Organized temp sessions are cleaned up automatically

### Key Benefits

- **🛡️ Data Safety**: Original files are never at risk of modification
- **🗂️ Professional Organization**: Enterprise-ready temp structure
- **🌍 Cross-Platform**: Seamless operation on all operating systems
- **⚡ Performance**: Organized structure improves processing efficiency
- **🔍 Transparency**: Easy to inspect and verify temp operations
- **🧹 Clean Operation**: Professional cleanup with no files left behind

### Testing Organized Temp Functionality

```bash
# Test the organized temp functionality
node demo-temp-organized.js
```

## 📊 Processing Workflow

1. **Excel Processing**: Processes tool inventory Excel files using organized temp structure
2. **JSON Discovery**: Finds and analyzes tool usage JSON files from JSONScanner
3. **Organized Copying**: Copies all files to organized "BRK CNC Management Dashboard/ToolManager" temp structure
4. **Data Sanitization**: Cleans and validates JSON data in temp processing
5. **Analysis**: Performs tool usage analysis and inventory comparison
6. **Report Generation**: Creates comprehensive analysis reports in organized temp results
7. **Cleanup**: Automatically cleans organized temp session

## 🛠 Available Scripts

| Script                        | Description                              |
| ----------------------------- | ---------------------------------------- |
| `node main.js`                | Run main application with organized temp |
| `node demo-temp-organized.js` | Demo organized temp structure            |
| `npm install`                 | Install dependencies                     |

## 🔍 Tool Analysis Features

The system provides comprehensive tool analysis including:

- **📊 Inventory Processing**: Automated Excel tool inventory processing
- **🔍 Usage Analysis**: Tool usage analysis from manufacturing JSON files
- **📈 Utilization Reports**: Tool utilization and efficiency reporting
- **⚖️ Inventory Comparison**: Matrix inventory vs actual usage comparison
- **🎯 Recommendations**: Tool management recommendations and alerts

## 🔗 Integration with BRK CNC Management Dashboard

ToolManager integrates seamlessly with the BRK CNC Management Dashboard ecosystem:

- **🔗 JSONScanner Integration**: Uses JSONScanner output for tool usage analysis
- **📊 Unified Reporting**: Compatible reporting format with other dashboard components
- **🗂️ Organized Structure**: Professional temp structure ready for dashboard integration
- **🔄 Data Flow**: Processes JSONScanner results for comprehensive tool management

## 🔗 Related Projects

- **JSONScanner**: Quality control system for NC files (provides tool usage data)
- **CNCManagementDashboard**: Main dashboard application
- **BRK CNC Management Dashboard**: Unified ecosystem for manufacturing management

## 📄 License

ISC License - BRK CNC Management Dashboard

---

_Updated: November 4, 2025 - Organized Temp Structure Implementation_
