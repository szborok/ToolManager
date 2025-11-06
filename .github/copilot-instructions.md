# ToolManager AI Assistant Instructions

## Project Overview

ToolManager is a Node.js-based CNC tool tracking system that processes Excel inventory files and JSON tool usage data to generate comprehensive tool analysis and work tracking reports. It features **complete read-only processing** with organized temporary file structure ("BRK CNC Management Dashboard") for maximum data safety - **original files are NEVER modified**.

## Architecture & Core Components

### Component Hierarchy
- **Executor** (`src/Executor.js`) - Main orchestrator, handles auto/manual modes and processing pipeline
- **Scanner** (`src/Scanner.js`) - Discovers and queues Excel files for processing
- **Analyzer** (`src/Analyzer.js`) - Parses Excel matrix files and extracts tool requirements
- **Matrix** (`src/Matrix.js`) - Handles Excel file parsing with ECUT/MFC/XF/XFEED tool categorization
- **ToolFactory** (`src/ToolFactory.js`) - Creates and manages tool objects with inventory tracking
- **Results** (`src/Results.js`) - Generates work tracking JSON files and analysis reports
- **DataManager** (`src/DataManager.js`) - Wraps StorageAdapter for JSON/MongoDB persistence
- **TempFileManager** (`utils/TempFileManager.js`) - Manages organized temp structure with read-only processing

### Data Flow Pattern
1. Scanner finds Excel files → 2. **Copy to temp** → 3. Matrix parses tool requirements → 4. ToolFactory matches inventory → 5. Results generates work tracking files **in temp only**

### Read-Only Temp Structure
**ALL processing happens in organized temp folders - original files untouched:**
```
📁 [OS Temp or User-Defined]/BRK CNC Management Dashboard/ToolManager/
   └── session_xxxxx/ (or persistent/)
       ├── input_files/     - Original Excel files copied here
       ├── processed_files/ - Sanitized versions
       ├── results/         - Analysis reports and work tracking JSON
       └── excel_files/     - Excel inventory data
```

## Critical Configuration

**Test vs Production Mode**: `config.js` has `app.testMode` flag that switches between `working_data/` (test) and `C:\Production\` (production) paths.

**Read-Only Processing Settings**:
- `app.usePersistentTempFolder: true` - Use organized temp structure
- `app.userDefinedWorkingFolder: null` - User can override temp location
- `app.tempBaseName: "BRK CNC Management Dashboard"` - Organized folder name

**Auto vs Manual Execution**:
- Auto mode: `node main.js --auto` (scans every 60s)
- Manual mode: `node main.js --manual --project "path/to/matrix.xlsx"`
- Custom temp: `node main.js --working-folder "D:/CNC_Processing"`

**Tool Categories**: Excel files categorized by naming patterns:
- ECUT tools: Cutting operations (8400xxx, 8410xxx, 8420xxx)
- MFC tools: Manufacturing center operations (8201xxx)
- XF/XFEED tools: Cross-feed operations (15250xxx, X7620xxx, X7624xxx)

## Development Workflows

**Entry Point**: `main.js` - Comprehensive CLI with `--mode`, `--project`, `--force`, `--cleanup`, `--setup`, `--working-folder` options

**Demo Mode**: `node demo-temp-organized.js` - Shows organized temp structure without processing real files

**Security Feature**: Uses `xlsx` library despite known vulnerabilities (acceptable for trusted internal Excel files only)

**Key Commands**:
- `node main.js --setup` - Initial configuration verification
- `node main.js --cleanup` - Remove all generated BRK files
- `node main.js --cleanup-stats` - Show cleanup statistics without deletion
- `node main.js --working-folder "D:/Custom"` - Use custom temp location

## Read-Only Processing Benefits

✅ **Zero Risk**: Original files never modified
✅ **Professional Organization**: Structured temp hierarchy
✅ **User Control**: Custom working folder support
✅ **Cross-Platform**: Automatic OS temp detection
✅ **Session Tracking**: Organized session management
✅ **Easy Export**: Copy results from temp when needed

## Tool Processing Pattern

Matrix files contain tool requirements parsed into categories:
```javascript
// Tool objects have: type, name, description, quantity, location
// Work tracking output: upcoming tool needs, inventory comparison
// Excel structure: follows specific column patterns for tool categorization
// All processing in temp - NO original file modification
```

## Storage Abstraction

DataManager supports both local JSON files and MongoDB via StorageAdapter. Unlike JSONScanner, ToolManager has `retentionPolicy.cleanupOldData: false` to preserve tool tracking history.

## Key File Paths

- Entry point: `main.js` (CLI arg parsing and mode selection)
- Config: `config.js` (test/production paths, tool categories, read-only settings)
- Demo: `demo-temp-organized.js` (safe demonstration mode)
- Structure doc: `FOLDER_STRUCTURE.md` (data organization patterns)
- Test data: `data/test_data/` (READ-ONLY - sample Excel files for development)
- Work data: `working_data/` (test mode processing folders)

## Common Debugging

1. **Excel parsing issues**: Check Matrix.js for column pattern recognition
2. **Tool categorization**: Verify tool naming patterns in config.tools section
3. **Path resolution**: Ensure test mode setting matches intended data location
4. **Missing work tracking**: Check ToolFactory inventory matching logic
5. **Temp structure**: Use demo mode to verify organized temp file handling
6. **Read-only violations**: All Results operations must use tempManager - no fallback to project root