# Test Data Directory

This directory contains all test files and sample data used for development and testing of the ToolManager application.

## 📁 Directory Structure

- **`filesToProcess/`** - Sample matrix files for testing daily processing
- **`filesProcessedArchive/`** - Archive of processed test files
- **`sampleExcels/`** - Reference Excel files showing different tool types:
  - `ECUT/` - E-Cut tools examples
  - `MFC/` - Multi-functional cutting tools examples
  - `XF/` - XF finishing tools examples
  - `XFeed/` - XFeed drilling tools examples
- **`analysis/`** - Output from Excel analysis and processing tests
- **`data/`** - Test work tracking and archive folders:
  - `workTracking/` - Generated work items for testing
  - `archive/` - Archive of completed test work items

## 🚨 Important Notes

### For Development

- All application testing uses files from this directory
- Safe to modify, delete, or recreate test files as needed
- Configuration automatically points to these test paths

### For Production Deployment

- **DO NOT** deploy this test_data folder to production servers
- Update `companyConfig/config.properties` with actual production paths
- Production paths should point to:
  - Network drives for incoming email attachments
  - Secure archive locations for processed files
  - Work tracking systems integrated with manufacturing workflow

## 🔧 Configuration

Current test paths in `companyConfig/config.properties`:

```properties
files.to.process.folder=test_data/filesToProcess
files.processed.folder=test_data/filesProcessedArchive
work.tracking.folder=test_data/data/workTracking
archive.folder=test_data/data/archive
sample.excels.folder=test_data/sampleExcels
```

For production, update these to actual server paths.
