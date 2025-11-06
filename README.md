# ToolManager

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional Node.js-based CNC tool tracking system that processes Excel inventory files and JSON tool usage data to generate comprehensive tool analysis and work tracking reports. Features **complete read-only processing** with organized temporary file structure for maximum data safety.

## 🎯 Features

### ✨ **Complete Read-Only Processing**
- **Zero Risk**: Original files are NEVER modified
- **Organized Temp Structure**: Professional `BRK CNC Management Dashboard/ToolManager/` hierarchy
- **User-Defined Working Folders**: Custom temp locations via `--working-folder` CLI option
- **Session Management**: Compatible with JSONScanner session tracking

### 🔧 **CNC Tool Management**
- **Excel Matrix Processing**: Parses complex Excel inventory files with ECUT/MFC/XF/XFEED categorization
- **Tool Requirement Analysis**: Extracts tool needs from project data
- **Work Tracking Generation**: Creates JSON files for upcoming tool requirements
- **Inventory Comparison**: Matches requirements against available tools

### 📊 **Data Processing**
- **Multi-Format Support**: Excel (.xlsx) and JSON file processing
- **Tool Categorization**: Automatic classification by naming patterns
- **Dual Storage**: Local JSON files and MongoDB integration
- **Results Export**: Organized analysis output with export functionality

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
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-tool-category`)
3. Add your tool category patterns to `config.js`
4. Test with `node demo-temp-organized.js`
5. Commit changes (`git commit -am 'Add new tool category'`)
6. Push to branch (`git push origin feature/new-tool-category`)
7. Create a Pull Request

### Adding Tool Categories

1. Update tool patterns in `config.js`
2. Modify parsing logic in `src/Matrix.js`
3. Test with sample Excel files
4. Update documentation

## 🔗 Integration with BRK CNC Management Dashboard

ToolManager integrates seamlessly with the BRK CNC Management Dashboard ecosystem:

- **🔗 JSONScanner Integration**: Uses JSONScanner output for tool usage analysis
- **📊 Unified Reporting**: Compatible reporting format with other dashboard components
- **🗂️ Organized Structure**: Professional temp structure ready for dashboard integration
- **🔄 Data Flow**: Processes JSONScanner results for comprehensive tool management

## 🔗 Related Projects

- **JSONScanner**: Quality control system for NC files (provides tool usage data)
- **CNCManagementDashboard**: Main dashboard application
- **ClampingPlateManager**: Manages CNC clamping plates and work orders

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for CNC tool inventory management
- Designed for complete data safety
- Excel processing with `xlsx` library
- Compatible with JSONScanner ecosystem
- Professional manufacturing workflow support

---

**Note**: This system prioritizes data safety through complete read-only processing. All operations use organized temp folder structures, ensuring original tool inventory data remains untouched while providing comprehensive analysis and work tracking capabilities.

ISC License - BRK CNC Management Dashboard

---

_Updated: November 4, 2025 - Organized Temp Structure Implementation_
