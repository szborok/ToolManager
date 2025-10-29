# ToolManager Directory Structure

## Folder Organization

### 📁 `test_data/` - **READ-ONLY TEST CASES**
- **DO NOT MODIFY, MOVE, OR DELETE**
- Contains sample Excel files and test cases
- Used only for development and testing
- Structure mirrors production data for testing

### 📁 `working_data/` - **ACTIVE PROCESSING**
- `filesToProcess/` - Excel files to be processed
- `filesProcessedArchive/` - Processed Excel files archive
- `data/workTracking/` - Generated work tracking JSON files
- `data/archive/` - General archive storage
- `analysis/` - Analysis reports and summaries

### 📁 `config_data/` - **CONFIGURATION**
- `schedules/` - Production schedule files
- Configuration files that can be modified

### 📁 `src/` - **SOURCE CODE**
- Core application files
- Tool classes and business logic

### 📁 `utils/` - **UTILITIES**
- Helper functions and utilities
- Logging, file operations, etc.

### 📁 `_old/` - **ARCHIVED FILES**
- Legacy files moved during restructuring
- Keep for reference but not used in active code

## Data Flow

```
Excel Files → working_data/filesToProcess/
             ↓
           Scanner & Analyzer
             ↓
Work Tracking → working_data/data/workTracking/
Archive      → working_data/data/archive/
Reports      → working_data/analysis/
```

## Configuration Modes

- **Test Mode**: Uses `working_data/` folders
- **Production Mode**: Uses `C:\Production\` paths
- **JSON Scanning**: Reads from json_scanner project (read-only)