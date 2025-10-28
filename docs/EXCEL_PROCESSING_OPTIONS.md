# Excel Processing Options - ToolManager

This document outlines all available Excel file processing modes in ToolManager, designed to handle different scenarios from manual processing to fully automated workflows.

## 🎯 **Processing Modes Overview**

### 📁 **1. Folder Watching (Hot Folder) - RECOMMENDED**

**Best for:** Automated processing when files appear in specific folders

```bash
# Start folder watching
npm run process:watch
# or
node processingManager.js watch
```

**How it works:**

- Monitors `test_data/filesToProcess/` folder (configurable)
- Automatically processes new Excel files as they appear
- Moves processed files to archive folder
- Continues running until stopped (Ctrl+C)

**Configuration:**

```properties
file.watcher.enabled=true
file.watcher.delay.ms=2000
processing.additional.watch.folders=C:\NetworkDrive\EmailAttachments
```

**Use cases:**

- Network folder monitoring for email attachments
- Dropbox/OneDrive folder monitoring
- Production environment automation

---

### 📧 **2. Email Processing - FRAMEWORK READY**

**Best for:** Processing Excel files directly from email attachments

```bash
# Configure email processing
npm run process:email --server imap.company.com --username toolmanager
```

**How it works:**

- Connects to email server (IMAP/Exchange)
- Monitors for emails with Excel attachments
- Downloads and processes matching files
- Archives processed emails

**Configuration:**

```properties
email.enabled=true
email.server=imap.company.com
email.username=toolmanager@company.com
email.attachment.pattern=.*Matrix.*\.xlsx$
email.check.interval=300000
```

**Status:** Framework complete, requires email server configuration

---

### 📄 **3. Manual File Processing**

**Best for:** On-demand processing of specific files

```bash
# Process single file
npm run process:manual "/path/to/matrix.xlsx"
# or with options
node processingManager.js manual "/path/to/matrix.xlsx" --moveAfterProcessing false
```

**How it works:**

- Process any Excel file by providing full path
- Immediate processing with results
- Configurable post-processing actions

**Options:**

- `--moveAfterProcessing true/false` - Move file after processing
- `--generateReport true/false` - Generate detailed report
- `--priority normal/high/low` - Processing priority

**Use cases:**

- Ad-hoc file processing
- Testing new files
- Recovery processing

---

### 📦 **4. Batch Processing**

**Best for:** Processing multiple files at once

```bash
# Process all files in folder
npm run process:batch "/path/to/folder/"
# or with parallel processing
node processingManager.js batch "/path/to/folder/" --parallel true --maxConcurrent 3
```

**How it works:**

- Processes all Excel files in specified folder
- Sequential or parallel processing
- Detailed batch results

**Options:**

- `--parallel true/false` - Enable parallel processing
- `--maxConcurrent 3` - Maximum concurrent files
- `--delayBetweenFiles 1000` - Delay between files (ms)

**Use cases:**

- Processing backlog of files
- Bulk historical data import
- Cleanup operations

---

### ⏰ **5. Scheduled Processing**

**Best for:** Regular automated processing

```bash
# Start daily processing at 6 AM
node processingManager.js schedule --interval daily --time 06:00 --enabled true
```

**How it works:**

- Processes files on predefined schedule
- Supports daily, hourly, custom intervals
- Integrates with system schedulers

**Configuration:**

```properties
scheduling.enabled=true
scheduling.interval=daily
scheduling.time=06:00
scheduling.auto.archive=true
```

**Use cases:**

- Daily morning inventory updates
- Regular maintenance processing
- Business hour automation

---

## 🛠️ **Management Commands**

### Status Monitoring

```bash
npm run process:status
```

Shows current status of all processing modes.

### Stop All Processing

```bash
npm run process:stop
```

Safely stops all active processing modes.

### Help

```bash
npm run process:help
```

Shows detailed usage information.

---

## 🔧 **Configuration Management**

All processing options are configured in `companyConfig/config.properties`:

### Key Settings:

```properties
# Base folders
files.to.process.folder=test_data/filesToProcess
files.processed.folder=test_data/filesProcessedArchive

# Processing modes
file.watcher.enabled=true
email.enabled=false
scheduling.enabled=false

# Performance settings
batch.processing.max.concurrent=3
batch.processing.delay.between.files=1000
```

### Production Setup:

1. Update folder paths to network locations
2. Configure email server settings
3. Enable desired processing modes
4. Set up system services for scheduled processing

---

## 📊 **Processing Workflow**

### Standard Flow:

1. **File Detection** → Folder watcher or manual trigger
2. **Validation** → Check file format and accessibility
3. **Processing** → Extract tool inventory using ExcelProcessor
4. **Output Generation** → Save JSON results and reports
5. **Archiving** → Move processed files to archive
6. **Logging** → Record processing results and errors

### Error Handling:

- Invalid files are logged and skipped
- Processing errors are captured with details
- Failed files can be reprocessed manually
- All errors logged to `logs/` folder

---

## 🚀 **Recommended Setup by Environment**

### Development/Testing:

```bash
# Use manual processing for testing
npm run process:manual "test_data/filesToProcess/sample.xlsx"
```

### Office Environment:

```bash
# Start folder watching for network drives
npm run process:watch
```

### Production Server:

```bash
# Configure scheduled processing + folder watching
npm run process:schedule --interval daily --time 06:00
npm run process:watch
```

### Email Integration:

```bash
# Enable email processing after server configuration
npm run process:email --enabled true
```

---

## 📝 **Next Steps**

Based on your requirements, I recommend:

1. **Start with Folder Watching** - Most flexible and immediate
2. **Add Manual Processing** - For ad-hoc needs
3. **Configure Email Processing** - When email server details available
4. **Implement Scheduling** - For production automation

Would you like me to:

- Configure any specific processing mode?
- Set up the email integration details?
- Create additional custom processing options?
- Add monitoring and alerting features?
