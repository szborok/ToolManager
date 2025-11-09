# ToolManager Directory Structure

## Folder Organization

### 📁 `data/test_source_data/` - **READ-ONLY TEST CASES**

- **DO NOT MODIFY, MOVE, OR DELETE**
- Contains sample Excel files and test JSON data
- Used only for development and testing
- Structure:
  - `testJSON/` - JSON files from CNC machines (test data)
  - `testExcel/` - Excel matrix files for tool tracking
  - `schedules/` - Sample production schedules

### 📁 `data/test_processed_data/` - **TEST MODE TEMP BASE**

- Base directory for BRK temp structure in test mode
- Contains: `BRK CNC Management Dashboard/ToolManager/`
- Auto-created, cleaned up automatically
- **DO NOT commit to version control**

### 📁 `archive/` - **ARCHIVED & LEGACY FILES**

- Old files moved during restructuring
- Legacy `working_data_legacy_YYYYMMDD/` folders
- Keep for reference but not used in active code

### 📁 `src/` - **SOURCE CODE**

- Core application files
- Tool classes and business logic
- Scanner, Analyzer, Executor modules

### 📁 `utils/` - **UTILITIES**

- Helper functions and utilities
- Logging, file operations, temp management
- CleanupService, TempFileManager, etc.

### 📁 `logs/` - **APPLICATION LOGS**

- Daily rotating log files
- Auto-managed by Logger utility

## BRK CNC Management Dashboard Structure

**ALL PROCESSING HAPPENS IN ORGANIZED TEMP FOLDERS:**

```
📁 [OS Temp or User-Defined]/BRK CNC Management Dashboard/ToolManager/
   └── session_xxxxx/ (or persistent/)
       ├── input_files/     - Original JSON/Excel files copied here
       ├── processed_files/ - Sanitized versions
       ├── results/         - Analysis reports and work tracking JSON
       └── excel_files/     - Excel inventory data
```

### Read-Only Processing Benefits:

✅ **Zero Risk** - Original files never modified  
✅ **Professional Organization** - Structured temp hierarchy  
✅ **User Control** - Custom working folder support  
✅ **Cross-Platform** - Automatic OS temp detection  
✅ **Session Tracking** - Organized session management  
✅ **Easy Export** - Copy results from temp when needed

## Data Flow

```
Excel Files (test_source_data/testExcel/) → Copy to BRK temp/input_files/
JSON Files (test_source_data/testJSON/)   → Copy to BRK temp/input_files/
                    ↓
              Scanner & Analyzer
                    ↓
Work Tracking → BRK temp/results/ (JSON files)
Analysis      → BRK temp/results/ (Reports)
Archives      → BRK temp/excel_files/
```

## Configuration Modes

### Test Mode (testMode: true)

- **Reads from**: `data/test_source_data/testJSON/` and `testExcel/`
- **Processes in**: `data/test_processed_data/BRK CNC Management Dashboard/ToolManager/`
- **Safe for development** - no production data touched

### Production Mode (testMode: false)

- **Reads from**: `C:\Production\CNC_Data\` and `C:\Production\Matrix\`
- **Processes in**: `C:\Production\BRK CNC Management Dashboard\ToolManager\`
- **Custom location**: Use `--working-folder` to override

## Key Paths

| Purpose         | Test Mode                          | Production Mode                   |
| --------------- | ---------------------------------- | --------------------------------- |
| JSON Source     | `data/test_source_data/testJSON/`  | `C:\Production\CNC_Data\`         |
| Excel Source    | `data/test_source_data/testExcel/` | `C:\Production\Matrix\`           |
| Temp Processing | `data/test_processed_data/BRK...`  | OS temp or `C:\Production\BRK...` |
| Schedules       | `data/test_source_data/schedules/` | `C:\Production\Schedules\`        |

## Commands

```bash
# Development
npm run auto              # Continuous scanning (60s intervals)
npm run manual            # Process specific file
npm run test              # Single test run
npm run test-quick        # Quick storage tests
npm run debug             # Debug utilities

# Result Management
npm run list-results      # Show current temp results
npm run export-results    # Export to permanent location

# Cleanup
npm run cleanup           # Remove all BRK generated files
npm run cleanup-stats     # Show what would be cleaned
```

## Notes

- **Legacy `working_data/` folder**: Archived, no longer used
- **All processing**: Read-only via BRK temp structure
- **Original files**: Never modified, always safe
