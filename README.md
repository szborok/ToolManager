# ToolManager - JavaScript Version

A CNC Tool Management System for tracking and managing manufacturing tools.

## ⚠️ Security Notice

This application uses the `xlsx` library which has known security vulnerabilities. This is acceptable for our use case because:

- We only process trusted Excel files from known sources
- Files are processed in an isolated environment
- No user-uploaded files are processed directly
- The application is for internal manufacturing use only

No alternative library provides the same Excel reading capabilities required for our matrix file processing.

## 🚀 Quick Start

1. **Setup the application:**

   ```bash
   npm install
   npm run setup
   ```

2. **Run the main application:**

   ```bash
   npm start
   ```

3. **Process daily matrix files:**

   ```bash
   # Process files once
   npm run daily

   # Watch for new files automatically
   npm run daily-watch

   # Check processing statistics
   npm run daily-stats
   ```

## 📁 Project Structure

```
ToolManager/
├── main.js                    # Main application entry point
├── processDaily.js            # Daily file processing CLI
├── setup.js                   # Setup and verification script
├── src/                       # Source code
│   ├── config/               # Configuration files
│   ├── enums/                # Enumerations
│   ├── factories/            # Factory classes
│   ├── models/               # Data models
│   ├── services/             # Business logic services
│   └── utils/                # Utility classes
├── config/                    # Application configuration
├── companyConfig/            # Company-specific settings
├── test_data/                # Test data and sample files
│   ├── filesToProcess/      # Sample matrix files for testing
│   ├── filesProcessedArchive/ # Test processed files archive
│   ├── sampleExcels/        # Reference Excel files for tool types
│   ├── analysis/            # Analysis output files
│   └── data/                # Test work tracking and archive
├── dev/                      # Development utilities
├── logs/                     # Application logs
├── temp/                     # Temporary files
└── _old/                     # Legacy Java files (archived)
```

## 🔧 Configuration

### Main Configuration

- `companyConfig/config.properties` - Main application settings
- `config/tool-definitions.json` - Tool categories and identification rules

### Key Settings

- **Planning Days**: Default 7 days ahead for work scheduling
- **Tool Categories**: ECUT, MFC, XF, XFEED
- **File Patterns**: Configurable filename patterns with date placeholders
- **Work Tracking**: Automatic JSON file generation for work items

## 📊 Daily Workflow

1. **Receive Matrix File**: Email attachment `Euroform_Matrix_YYYY-MM-DD.xlsx`
2. **Save to Processing**: Drop file into `test_data/filesToProcess/` (test) or production folder
3. **Run Processing**: Use `npm run daily` or file watcher
4. **Work Items Created**: JSON files generated in `test_data/data/workTracking/` (test) or production folder
5. **File Archived**: Original file moved to `test_data/filesProcessedArchive/` (test) or production folder

> **Note**: In development, all paths point to `test_data/` folders. For production deployment, update `companyConfig/config.properties` with actual server paths.

## 🛠 Available Scripts

| Script                | Description                                 |
| --------------------- | ------------------------------------------- |
| `npm start`           | Run main application                        |
| `npm run setup`       | Verify configuration and create directories |
| `npm run daily`       | Process all new matrix files                |
| `npm run daily-watch` | Start file watcher for automatic processing |
| `npm run daily-stats` | Show processing statistics                  |
| `npm run analyze`     | Analyze Excel file structure (development)  |
| `npm run test-excel`  | Test Excel processor (development)          |

## 🔍 Tool Identification

The system automatically identifies tools based on:

- **Prefixes**: Tool codes starting with specific patterns
- **Keywords**: Tool descriptions containing specific terms
- **Confidence Scoring**: Minimum 70% confidence required

### Supported Tool Categories

| Category | Description                    | Prefixes     | Priority |
| -------- | ------------------------------ | ------------ | -------- |
| ECUT     | End mills and cutting tools    | EC, ECUT, EM | High     |
| MFC      | Multi-functional cutting tools | MFC, MF      | High     |
| XF       | XF finishing tools             | XF, FIN      | Medium   |
| XFEED    | XFeed drilling tools           | XF, FEED, DR | Medium   |

## 📝 Work Tracking

Work items are automatically created as JSON files with:

- **Metadata**: Source file, dates, tool counts
- **Tool Data**: Identified tools with specifications
- **Processing Status**: Started, completed, results
- **Scheduling**: Default 7 days from file date

## ⚠️ Known Issues

- **XLSX Security**: Current xlsx library has known vulnerabilities (no fix available)
- **Tests**: Test framework not yet implemented
- **Validation**: Tool identification rules may need refinement

## 🔗 Related Projects

- **json_scanner**: Quality control system for NC files
- **Legacy Java Version**: Archived in `_old/` directory

## 📄 License

ISC License - Euroform Manufacturing

---

_Generated: October 28, 2025_
