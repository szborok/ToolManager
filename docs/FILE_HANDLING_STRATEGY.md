# File Handling Strategy - Excel Processing

## 🔄 **How File Processing Works**

When the ToolManager detects new Excel files, here's exactly what happens:

### 📁 **1. File Detection**

```
New Excel file appears in watch folder → File Watcher detects it
```

### 🔍 **2. Pre-Processing Checks**

```
✅ Is it an Excel file? (.xlsx, .xls)
✅ Has it been processed already? (Check registry)
✅ Is file stable? (Not still being written)
```

### ⚡ **3. Processing & Movement**

```
📊 Process Excel → Extract tool inventory
💾 Save results → JSON output files
📁 Move original → Archive folder (prevents reprocessing)
📝 Register → Track in processed files registry
```

---

## 🎯 **File Movement Behavior**

### **AUTOMATIC PROCESSING** (Folder Watching)

- ✅ **Files ARE moved** automatically after processing
- 📁 **Destination**: `test_data/filesProcessedArchive/`
- 🔄 **Why**: Prevents endless reprocessing of same files
- ⚠️ **Failed files**: Moved to `test_data/filesProcessedArchive/errors/`

### **MANUAL PROCESSING**

- 🔧 **Configurable**: You choose whether to move or keep
- 📝 **Default**: Move after processing (`manual.processing.move.after=true`)
- 💡 **Override**: `--moveAfterProcessing false` to keep original

### **BATCH PROCESSING**

- 📦 **Same as manual**: Respects moveAfterProcessing setting
- 🔄 **Sequential**: Processes and moves files one by one
- 📊 **Reports**: Shows which files moved where

---

## 🚫 **Reprocessing Prevention**

### **Problem Solved**:

Without file movement, the same Excel file would trigger processing repeatedly every time the watcher detects it.

### **Smart Registry System**:

```json
{
  "Matrix_2024_1024_1572892800000": {
    "fileName": "Matrix_2024.xlsx",
    "filePath": "/path/to/original/Matrix_2024.xlsx",
    "processedAt": "2025-10-28T18:00:00.000Z",
    "success": true,
    "toolCount": 142,
    "outputFile": "/path/to/output.json"
  }
}
```

### **Registry Features**:

- 🔍 **File signature**: `filename_size_modifiedTime`
- ⏰ **24-hour window**: Won't reprocess same file within 24h
- 🧹 **Auto-cleanup**: Removes entries older than 30 days
- 💾 **Persistent**: Survives application restarts

---

## 📂 **Folder Structure After Processing**

### **Before Processing**:

```
test_data/
  filesToProcess/
    ├── Matrix_Morning_2025-10-28.xlsx
    ├── Matrix_Evening_2025-10-27.xlsx
    └── ToolInventory_Weekly.xlsx
```

### **After Processing**:

```
test_data/
  filesToProcess/
    └── (empty - all files processed and moved)

  filesProcessedArchive/
    ├── Matrix_Morning_2025-10-28.xlsx
    ├── Matrix_Evening_2025-10-27.xlsx
    ├── ToolInventory_Weekly.xlsx
    └── errors/
        └── ERROR_2025-10-28T18-00-00_BadFile.xlsx

  data/
    workTracking/
      ├── Matrix_Morning_2025-10-28_processed_2025-10-28T18-00-00.json
      ├── Matrix_Evening_2025-10-27_processed_2025-10-28T18-00-00.json
      ├── ToolInventory_Weekly_processed_2025-10-28T18-00-00.json
      └── processed_files_registry.json
```

---

## ⚙️ **Configuration Options**

### **Automatic Processing**:

```properties
# Move files after processing (prevents reprocessing)
auto.processing.move.after=true

# Generate detailed reports
auto.processing.generate.report=true

# Enable reprocessing prevention
auto.processing.prevent.reprocessing=true

# Error files folder name
auto.processing.error.folder=errors
```

### **Manual Processing**:

```properties
# Default behavior for manual processing
manual.processing.move.after=true
manual.processing.generate.report=true
```

---

## 🔄 **What Happens with New Files**

### **Scenario 1: New file appears**

```
1. File: "Matrix_2025-10-29.xlsx" → Folder
2. Watcher: "New file detected!"
3. System: Process → Save results → Move to archive
4. Result: File processed once, moved safely
```

### **Scenario 2: Same file appears again**

```
1. File: "Matrix_2025-10-29.xlsx" → Folder (copied back)
2. Watcher: "New file detected!"
3. Registry: "Already processed 2 hours ago"
4. Result: Skip processing, still move to archive
```

### **Scenario 3: Updated file**

```
1. File: "Matrix_2025-10-29_v2.xlsx" → Folder (different size/time)
2. Watcher: "New file detected!"
3. Registry: "Different signature, not processed"
4. Result: Process as new file
```

### **Scenario 4: Processing fails**

```
1. File: "CorruptMatrix.xlsx" → Folder
2. System: Attempt processing → Fails
3. Error handler: Move to errors/ folder
4. Result: File removed from watch folder, won't retry
```

---

## 💡 **Best Practices**

### **For Development**:

- ✅ Use `test_data/filesToProcess/` for testing
- ✅ Files will be moved to `test_data/filesProcessedArchive/`
- ✅ Check registry to see processing history

### **For Production**:

- ✅ Point `files.to.process.folder` to network drive
- ✅ Point `files.processed.folder` to secure archive
- ✅ Monitor error folder for failed files
- ✅ Set up log monitoring for processing issues

### **For Email Integration**:

- ✅ Email attachments → Download to watch folder
- ✅ System automatically processes and archives
- ✅ Email marked as processed

---

## ❓ **Common Questions**

**Q: What if I want to reprocess a file?**
A: Copy it back to watch folder with a new name or wait 24 hours, or delete the registry entry.

**Q: What if processing fails?**  
A: File moves to error folder, check logs for details, fix issue and reprocess manually.

**Q: Can I process without moving files?**
A: Yes, use manual processing with `--moveAfterProcessing false`

**Q: What about file conflicts?**
A: System adds timestamps to prevent overwrites in archive folder.

**Q: How do I clean up old processed files?**
A: Set up scheduled cleanup or manually archive old files from `filesProcessedArchive/`

This system ensures **reliable, non-duplicate processing** while maintaining full traceability of what was processed when! 🚀
