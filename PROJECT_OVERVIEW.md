# ToolManager - CNC Tool Tracking System

## Overview

ToolManager is a Node.js-based CNC tool tracking system that processes Excel inventory files and JSON tool usage data to generate comprehensive tool analysis and work tracking reports. Features **complete read-only processing** with organized temporary file structure for maximum data safety.

## Core Purpose

- **Tool Inventory Management**: Track CNC tool inventory from Excel files
- **Usage Analysis**: Monitor tool requirements from CNC projects
- **Work Tracking**: Generate upcoming tool needs and availability reports
- **Excel Integration**: Process matrix files with ECUT/MFC/XF/XFEED categorization

---

## Architecture

### Component Flow

```
Scanner → Analyzer → ToolFactory → Results
   ↓         ↓           ↓            ↓
Find    Parse     Match tools    Generate
Excel   matrix    with inventory  tracking
files   data                      reports
```

### Key Components

- **Executor** (`src/Executor.js`) - Main orchestrator, handles auto/manual modes
- **Scanner** (`src/Scanner.js`) - Discovers and queues Excel files
- **Analyzer** (`src/Analyzer.js`) - Parses Excel matrix files
- **Matrix** (`src/Matrix.js`) - Excel file parsing with tool categorization
- **ToolFactory** (`src/ToolFactory.js`) - Creates and manages tool objects
- **Results** (`src/Results.js`) - Generates work tracking JSON files
- **DataManager** (`src/DataManager.js`) - Local JSON file persistence
- **TempFileManager** (`utils/TempFileManager.js`) - Read-only processing management

### Data Model

```javascript
Tool {
  type: "ECUT|MFC|XF|XFEED",
  name: "D8400123",
  description: "Cutting tool 40mm",
  quantity: 5,
  location: "Shelf A-12",
  inUse: 2,
  available: 3
}

Project {
  name: "W5270NS01001",
  matrixFile: "matrix_2025_01.xlsx",
  requiredTools: [
    { tool: "D8400123", quantity: 2 },
    { tool: "D8410456", quantity: 1 }
  ]
}
```

---

## Centralized Test Data Setup

**Important**: ToolManager uses centralized test data from `CNC_TestData` repository.

### Directory Structure

```
Projects/
├── CNC_TestData/                    ← Centralized test data (auto-cloned)
│   ├── source_data/
│   │   ├── matrix_excel_files/      ← Tool matrix Excel (READ-ONLY)
│   │   └── json_files/              ← CNC project data (READ-ONLY)
│   └── working_data/
│       └── BRK CNC Management Dashboard/
│           └── toolmanager/         ← Processing output
│               └── session_demo/
│                   ├── input_files/
│                   ├── processed_files/
│                   ├── results/
│                   └── excel_files/
└── ToolManager/                     ← This project
    ├── config.js                    ← Points to ../CNC_TestData
    ├── main.js
    └── scripts/
        └── setup-test-data.js       ← Auto-clones CNC_TestData
```

### Automatic Setup

**First time setup** (happens automatically on `npm install`):

```bash
npm install  # Runs postinstall → setup-test-data.js → clones CNC_TestData
```

**Manual setup** (if needed):

```bash
npm run setup-test-data  # Clones or updates CNC_TestData
```

**Running tests**:

```bash
npm test  # Runs pretest → setup-test-data.js → updates test data → runs tests
```

### Configuration

`config.js` points to centralized test data:

```javascript
excelScanPath: path.join(__dirname, "..", "CNC_TestData", "source_data", "matrix_excel_files"),
jsonScanPath: path.join(__dirname, "..", "CNC_TestData", "source_data", "json_files"),
testProcessedDataPath: path.join(__dirname, "..", "CNC_TestData", "working_data", "toolmanager"),
```

**Test Mode vs Production Mode**:

- `app.testMode: true` → Uses `../CNC_TestData/` paths
- `app.testMode: false` → Uses production paths (configured in config.js)

---

## Tool Categorization System

### Category Patterns

ToolManager categorizes tools based on naming patterns in Excel files:

#### ECUT Tools (Cutting Operations)

- **Pattern**: `8400xxx`, `8410xxx`, `8420xxx`
- **Examples**: `D8400123`, `D8410456`, `D8420789`
- **Purpose**: Primary cutting operations

#### MFC Tools (Manufacturing Center)

- **Pattern**: `8201xxx`
- **Examples**: `D8201123`, `D8201456`
- **Purpose**: Manufacturing center operations

#### XF/XFEED Tools (Cross-Feed)

- **Pattern**: `15250xxx`, `X7620xxx`, `X7624xxx`
- **Examples**: `D15250123`, `X7620456`, `X7624789`
- **Purpose**: Cross-feed operations

### Category Configuration

```javascript
// config.js
tools: {
  ECUT: {
    patterns: ['8400', '8410', '8420'],
    description: "Cutting operations"
  },
  MFC: {
    patterns: ['8201'],
    description: "Manufacturing center operations"
  },
  XF: {
    patterns: ['15250', 'X7620', 'X7624'],
    description: "Cross-feed operations"
  }
}
```

---

## Excel Processing

### Matrix File Structure

Excel matrix files follow specific column patterns:

```
| Tool Code  | Description      | Qty | Location | Status |
|------------|------------------|-----|----------|--------|
| D8400123   | Cutting 40mm     | 5   | A-12     | OK     |
| D8410456   | Drilling 25mm    | 3   | B-08     | OK     |
```

### Processing Options

ToolManager supports multiple Excel processing strategies (see `docs/EXCEL_PROCESSING_OPTIONS.md`):

1. **Read-Only Processing** (Current): Copy to temp, process without modification
2. **In-Place Processing** (Disabled): Direct file modification (NOT USED)
3. **Backup & Modify** (Disabled): Create backup before modification (NOT USED)

**Current Strategy**: **Read-Only Processing** - Original files NEVER modified.

---

## Read-Only Processing Pattern

ToolManager follows **strict read-only processing**:

1. **Source Data**: Never modified, always in `../CNC_TestData/source_data/`
2. **Copy to Temp**: Files copied to `working_data/.../input_files/`
3. **Processing**: Analysis happens in temp structure
4. **Results**: Written to `working_data/.../results/`

**Temp Structure**:

```
working_data/BRK CNC Management Dashboard/toolmanager/
└── session_demo/          # Or session_xxxxx for timestamped runs
    ├── input_files/       # Copied Excel files
    ├── processed_files/   # Sanitized Excel data
    ├── results/           # Work tracking JSON files
    │   └── tool_tracking_2025-01-15.json
    └── excel_files/       # Excel inventory data
```

---

## Operating Modes

### Auto Mode (Continuous Scanning)

```bash
npm run auto
# or
node main.js --auto
```

- Scans every 60 seconds
- Processes all Excel files in scan path
- Logs activity to `logs/`

### Manual Mode (Single Project)

```bash
npm run manual
# or
node main.js --manual --project "/path/to/matrix.xlsx"
```

- Process specific Excel file
- Generate immediate work tracking report
- Useful for debugging

### Custom Working Folder

```bash
node main.js --working-folder "/path/to/custom/temp"
```

- Override default temp location
- Useful for production environments

---

## CLI Commands

### Development

```bash
npm run auto             # Auto mode (continuous scanning)
npm run manual           # Manual mode (single project)
```

### Setup & Maintenance

```bash
npm run setup            # Initial configuration verification
npm run cleanup          # Remove all generated BRK files
npm run cleanup-stats    # Show cleanup statistics without deletion
```

### Custom Options

```bash
node main.js --help                          # Show all CLI options
node main.js --mode auto                     # Explicit auto mode
node main.js --mode manual --project "..."   # Explicit manual mode
node main.js --force                         # Force reprocessing
```

---

## Work Tracking Reports

### Output Format

```json
{
  "generated": "2025-01-15T10:30:00.000Z",
  "projects": [
    {
      "name": "W5270NS01001",
      "matrixFile": "matrix_2025_01.xlsx",
      "requiredTools": [
        {
          "toolCode": "D8400123",
          "description": "Cutting tool 40mm",
          "category": "ECUT",
          "quantityNeeded": 2,
          "quantityAvailable": 3,
          "status": "available"
        },
        {
          "toolCode": "D8410456",
          "description": "Drilling 25mm",
          "category": "ECUT",
          "quantityNeeded": 3,
          "quantityAvailable": 1,
          "status": "shortage",
          "shortageAmount": 2
        }
      ],
      "summary": {
        "totalTools": 5,
        "available": 3,
        "shortages": 2
      }
    }
  ]
}
```

### Usage

Work tracking reports are:

1. Generated in `working_data/.../results/`
2. Read by CNCManagementDashboard
3. Used for production planning
4. Updated on each scan cycle

---

## Configuration Reference

### Test/Production Paths

```javascript
app: {
  testMode: true,                  // Toggle test/production
  usePersistentTempFolder: true,   // Use organized temp structure
  tempBaseName: "BRK CNC Management Dashboard",
  userDefinedWorkingFolder: null   // Override temp location
}
```

### Scan Settings

```javascript
scanner: {
  scanInterval: 60000,             // 60 seconds
  excelExtensions: ['.xlsx', '.xls'],
  ignoreFolders: ['node_modules', '.git', 'backup']
}
```

### Tool Categories

```javascript
tools: {
  ECUT: { patterns: ['8400', '8410', '8420'] },
  MFC: { patterns: ['8201'] },
  XF: { patterns: ['15250', 'X7620', 'X7624'] }
}
```

---

## Security Considerations

### xlsx Library Vulnerability

ToolManager uses the `xlsx` library which has known vulnerabilities. This is **acceptable** because:

1. **Trusted Sources**: Only processes internal Excel files from trusted sources
2. **No User Upload**: No public-facing file upload functionality
3. **Isolated Environment**: Runs in controlled manufacturing environment
4. **Read-Only**: Files are processed read-only in temp structure

**Risk Assessment**: Low - Internal use only with trusted data sources.

---

## Development Workflow

### Adding a New Tool Category

1. **Update configuration**: `config.js`

   ```javascript
   tools: {
     NEWCAT: {
       patterns: ['9999'],
       description: "New category description"
     }
   }
   ```

2. **Update Matrix parsing**: `src/Matrix.js`

   ```javascript
   categorizeTool(toolCode) {
     if (toolCode.includes('9999')) return 'NEWCAT';
     // ... existing logic
   }
   ```

3. **Test categorization**:
   ```bash
   npm run manual  # Test on sample Excel file
   ```

### Modifying Excel Processing

1. **Review current strategy**: `docs/EXCEL_PROCESSING_OPTIONS.md`
2. **Update TempFileManager**: `utils/TempFileManager.js`
3. **Update Matrix parser**: `src/Matrix.js`
4. **Run tests**: `npm test`

### Testing Changes

```bash
# Quick test on single file
npm run manual

# Full test suite
npm test

# Test with specific Excel file
node main.js --manual --project "/path/to/matrix.xlsx"
```

---

## Common Tasks

### Process a Single Excel File

```bash
node main.js --manual --project "../CNC_TestData/source_data/matrix_excel_files/matrix_2025_01.xlsx"
```

### View Work Tracking Report

```bash
cat ../CNC_TestData/working_data/BRK\ CNC\ Management\ Dashboard/toolmanager/session_demo/results/tool_tracking_*.json
```

### Check Recent Logs

```bash
tail -f logs/app-$(date +%Y-%m-%d).log
```

### Clean All Generated Files

```bash
npm run cleanup
# or
npm run cleanup-stats  # Preview what will be deleted
```

### Update Test Data

```bash
npm run setup-test-data  # Pulls latest from CNC_TestData repo
```

---

## Troubleshooting

### Issue: "CNC_TestData not found"

**Solution**: Run `npm run setup-test-data`

### Issue: "No Excel files found"

**Solution**:

1. Verify `CNC_TestData` is sibling folder
2. Check `config.excelScanPath` path
3. Ensure Excel files exist in `source_data/matrix_excel_files/`

### Issue: "Tool categorization incorrect"

**Solution**:

1. Check tool naming patterns in config.js
2. Verify Excel file structure
3. Review Matrix.js categorization logic

### Issue: "Excel parsing fails"

**Solution**:

1. Verify Excel file format (xlsx/xls)
2. Check column structure matches expected pattern
3. Review Matrix.js parsing logic
4. Check for corrupt Excel files

### Issue: "Original files modified"

**Solution**:

1. Check TempFileManager logic
2. Verify read-only processing pattern
3. Report bug - should NEVER modify source data

---

## Dependencies

### Core

- **Node.js**: 18+ required
- **xlsx**: Excel file parsing (⚠️ Known vulnerabilities, acceptable for internal use)

### Development

- **Scripts**: Custom setup and utility scripts
- **Testing**: Built-in test runner

### Minimal Dependencies

ToolManager intentionally has minimal dependencies for maximum portability.

---

## File Organization

```
ToolManager/
├── main.js                 # Entry point, CLI arg parsing
├── config.js               # All settings (test/prod paths, tool categories)
├── package.json
├── README.md
├── PROJECT_OVERVIEW.md     # This file
├── TEST_DATA_SETUP.md      # Centralized test data docs
├── FOLDER_STRUCTURE.md     # Data organization patterns
├── src/
│   ├── Executor.js         # Main orchestrator
│   ├── Scanner.js          # Excel file discovery
│   ├── Analyzer.js         # Excel parsing orchestration
│   ├── Matrix.js           # Excel file parsing
│   ├── ToolFactory.js      # Tool object creation
│   ├── Tool.js             # Tool model
│   ├── ToolLogic.js        # Tool business logic
│   ├── Project.js          # Project model
│   ├── Results.js          # Work tracking generation
│   ├── DataManager.js      # File persistence
│   └── ExcelProcessor.js   # Excel-specific utilities
├── utils/
│   ├── Logger.js           # Structured logging
│   ├── TempFileManager.js  # Read-only processing
│   ├── FileUtils.js        # File operations
│   ├── CleanupService.js   # Cleanup operations
│   └── ProgressTracker.js  # Progress reporting
├── scripts/
│   └── setup-test-data.js  # Auto-clone CNC_TestData
├── logs/                   # Daily log files
└── docs/
    ├── EXCEL_PROCESSING_OPTIONS.md
    └── FILE_HANDLING_STRATEGY.md
```

---

## Integration with Dashboard

ToolManager is designed to integrate with CNCManagementDashboard:

1. **Work Tracking Reports**: Written to `working_data/.../results/`
2. **Dashboard Reads**: Frontend reads from centralized working_data
3. **Real-time Updates**: Dashboard polls for new work tracking files
4. **Unified View**: All backend results displayed in single interface

---

## Best Practices

### Excel Processing

- ✅ Always use read-only processing
- ✅ Copy to temp before processing
- ✅ Validate Excel structure before parsing
- ✅ Handle corrupt files gracefully
- ❌ Never modify original Excel files

### Tool Categorization

- ✅ Use clear naming patterns
- ✅ Document category purposes
- ✅ Test new categories thoroughly
- ❌ Don't overlap patterns between categories

### Performance

- ✅ Process Excel files in parallel when possible
- ✅ Cache parsed Excel data
- ✅ Log progress for long operations
- ❌ Don't load entire Excel directory into memory

### Logging

- ✅ Log at appropriate levels (info/warn/error)
- ✅ Include relevant context (fileName, toolCode)
- ✅ Use structured logging with objects
- ❌ Don't log sensitive data (if any)

---

## Future Enhancements

### Planned Features

- [ ] Web UI for tool management
- [ ] Real-time inventory tracking
- [ ] Automated reorder suggestions
- [ ] Advanced filtering and search
- [ ] Export to PDF reports

### Technical Improvements

- [ ] TypeScript migration
- [ ] Comprehensive test coverage
- [ ] Performance benchmarking
- [ ] Alternative Excel library (no vulnerabilities)

---

## Related Documentation

- **Setup Guide**: `TEST_DATA_SETUP.md`
- **Folder Structure**: `FOLDER_STRUCTURE.md`
- **Excel Processing**: `docs/EXCEL_PROCESSING_OPTIONS.md`
- **File Handling**: `docs/FILE_HANDLING_STRATEGY.md`
- **AI Assistant Context**: `.github/copilot-instructions.md`
- **Ecosystem Context**: `../CNC_TestData/AI_AGENT_CONTEXT.md`

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review `FOLDER_STRUCTURE.md`
3. Check recent logs with `tail -f logs/*.log`
4. Refer to ecosystem context in `../CNC_TestData/AI_AGENT_CONTEXT.md`

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0  
**Maintainer**: szborok
