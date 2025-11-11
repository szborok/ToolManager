# ToolManager AI Assistant Instructions

## Project Overview

ToolManager is a Node.js-based CNC tool tracking system that processes Excel inventory files and JSON tool usage data to generate comprehensive tool analysis and work tracking reports. It features **complete read-only processing** with organized temporary file structure ("BRK CNC Management Dashboard") for maximum data safety - **original files are NEVER modified**. Operates in **AUTO mode by default** with REST API service.

## Architecture & Core Components

### Component Hierarchy
- **Executor** (`src/Executor.js`) - Main orchestrator, handles auto/manual modes and processing pipeline
- **Scanner** (`src/Scanner.js`) - Discovers and queues Excel files for processing
- **Analyzer** (`src/Analyzer.js`) - Parses Excel matrix files and extracts tool requirements
- **Matrix** (`src/Matrix.js`) - Handles Excel file parsing with ECUT/MFC/XF/XFEED tool categorization
- **ToolFactory** (`src/ToolFactory.js`) - Creates and manages tool objects with inventory tracking
- **Results** (`src/Results.js`) - Generates work tracking JSON files and analysis reports
- **DataManager** (`src/DataManager.js`) - Manages local JSON file persistence and API data access
- **TempFileManager** (`utils/TempFileManager.js`) - Manages organized temp structure with read-only processing
- **API Server** (`server/index.js`) - Express REST API for external integrations (port 3002)

### Data Flow Pattern
1. Scanner finds Excel files → 2. **Copy to temp** → 3. Matrix parses tool requirements → 4. ToolFactory matches inventory → 5. Results generates work tracking files **in temp only** → 6. API serves data to Dashboard

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

**PRODUCTION MODE (Default)**:
- `config.js` has `app.testMode: false` - Use production CNC data paths
- `app.autoMode: true` - Continuous processing every 60 seconds
- **Test mode only via**: `node main.js --test` flag

**Read-Only Processing Settings**:
- `app.usePersistentTempFolder: true` - Use organized temp structure
- `app.userDefinedWorkingFolder: null` - User can override temp location
- `app.tempBaseName: "BRK CNC Management Dashboard"` - Organized folder name

**API Server**:
- Port: 3002
- Endpoints: `/api/status`, `/api/tools`, `/api/tools/:id`, `/api/projects`, `/api/analysis/upcoming`
- CORS enabled for localhost:5173 (Dashboard) and localhost:3000
- Uses DataManager for real data (no mocks)

**Execution Modes**:
- Auto mode: `npm run serve` (scans every 60s + REST API)
- Manual mode: `node main.js --manual --project "path/to/matrix.xlsx"`
- Custom temp: `node main.js --working-folder "D:/CNC_Processing"`

**Tool Categories**: Excel files categorized by naming patterns:
- ECUT tools: Cutting operations (8400xxx, 8410xxx, 8420xxx)
- MFC tools: Manufacturing center operations (8201xxx)
- XF/XFEED tools: Cross-feed operations (15250xxx, X7620xxx, X7624xxx)

## REST API Integration (Nov 11, 2025)

**Express Server** (`server/index.js`):
```javascript
GET /api/status - Server health and mode status
GET /api/tools - All tools with filtering (status, isMatrix)
GET /api/tools/:id - Specific tool details
GET /api/projects - Tool usage by project
GET /api/analysis/upcoming - Upcoming tool requirements
```

**DataManager API Methods**:
- `getAllTools(filter)` - Returns all tools from ToolManager_Result.json
  - Filter: `{ status: 'active'|'inactive', isMatrix: true|false }`
- `getToolById(toolId)` - Returns specific tool data
- `getProjects()` - Returns tool usage by project
- `getUpcomingTools()` - Returns upcoming tool requirements
- `groupToolsByType()` - Groups tools by ECUT/MFC/XF/XFEED categories
- `extractToolType(toolName)` - Determines tool category from naming pattern
- All methods read from real `ToolManager_Result.json` files

## Development Workflows

**Entry Point**: `main.js` - Comprehensive CLI with `--mode`, `--project`, `--force`, `--cleanup`, `--setup`, `--working-folder`, `--test` options

**API Server**: `npm run serve` - Starts AUTO mode processing + REST API (production ready)

**Demo Mode**: `node demo-temp-organized.js` - Shows organized temp structure without processing real files

**Security Feature**: Uses `xlsx` library despite known vulnerabilities (acceptable for trusted internal Excel files only)

**Key Commands**:
- `npm run serve` - **Production mode**: Continuous processing (60s) + REST API
- `node main.js --setup` - Initial configuration verification
- `node main.js --cleanup` - Remove all generated BRK files
- `node main.js --cleanup-stats` - Show cleanup statistics without deletion
- `node main.js --working-folder "D:/Custom"` - Use custom temp location
- `node main.js --test` - Enable test mode temporarily

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

## Storage

All data is stored in local JSON files within the organized temp structure. ToolManager uses TempFileManager for read-only processing. API endpoints read from `ToolManager_Result.json` in temp results.

## Key File Paths

- Entry point: `main.js` (CLI arg parsing and mode selection)
- API server: `server/index.js` (Express REST API on port 3002)
- Config: `config.js` (test/production paths, tool categories, read-only settings, **testMode: false**)
- DataManager: `src/DataManager.js` (API data access layer with real methods)
- Demo: `demo-temp-organized.js` (safe demonstration mode)
- Structure doc: `FOLDER_STRUCTURE.md` (data organization patterns)
- Test data: `data/test_data/` (READ-ONLY - sample Excel files for development)
- Work data: `working_data/` (test mode processing folders)

## Common Debugging

1. **Excel parsing issues**: Check Matrix.js for column pattern recognition
2. **Tool categorization**: Verify tool naming patterns in config.tools section
3. **Path resolution**: Ensure test mode setting matches intended data location (default production)
4. **Missing work tracking**: Check ToolFactory inventory matching logic
5. **Temp structure**: Use demo mode to verify organized temp file handling
6. **Read-only violations**: All Results operations must use tempManager - no fallback to project root
7. **API not responding**: Check port 3002, verify `npm run serve` running
8. **Mock data in API**: **NEVER ACCEPTABLE** - DataManager must read from real result files

## CRITICAL Rules for AI Agents

1. **NEVER create mock data** - All data from real Excel/JSON CNC files
2. **Production mode is default** - `testMode: false`, `autoMode: true` in config.js
3. **Test mode requires flag** - Use `--test` CLI argument, not config change
4. **API serves real data** - DataManager reads from actual ToolManager_Result.json
5. **AUTO mode for production** - Continuous processing, not manual mode
6. **Port 3002 reserved** - REST API server for Dashboard integration
7. **Read-only processing** - NEVER modify original Excel files

---

**Last Updated**: November 11, 2025
**Status**: Production Ready - REST API Integrated
**Architecture**: AUTO Mode + Express API (port 3002) + Read-Only Processing

## Architecture & Core Components

### Component Hierarchy
- **Executor** (`src/Executor.js`) - Main orchestrator, handles auto/manual modes and processing pipeline
- **Scanner** (`src/Scanner.js`) - Discovers and queues Excel files for processing
- **Analyzer** (`src/Analyzer.js`) - Parses Excel matrix files and extracts tool requirements
- **Matrix** (`src/Matrix.js`) - Handles Excel file parsing with ECUT/MFC/XF/XFEED tool categorization
- **ToolFactory** (`src/ToolFactory.js`) - Creates and manages tool objects with inventory tracking
- **Results** (`src/Results.js`) - Generates work tracking JSON files and analysis reports
- **DataManager** (`src/DataManager.js`) - Manages local JSON file persistence
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

## Storage

All data is stored in local JSON files within the organized temp structure. ToolManager uses TempFileManager for read-only processing.

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