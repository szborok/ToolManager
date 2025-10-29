// utils/CleanupService.js
/**
 * Cleanup service for removing generated files and work tracking items
 */

const fs = require("fs");
const path = require("path");
const config = require("../config");
const { logInfo, logWarn, logError } = require("./Logger");

class CleanupService {
  constructor() {}

  /**
   * Show cleanup statistics without deleting files
   */
  showStats() {
    console.log("📊 Cleanup Statistics:");
    
    try {
      const stats = this.gatherCleanupStats();
      
      console.log(`\n📁 Directories to clean:`);
      for (const [dir, count] of Object.entries(stats.directories)) {
        console.log(`  ${dir}: ${count} files`);
      }
      
      console.log(`\n📄 Total files that would be removed: ${stats.totalFiles}`);
      console.log(`💾 Total size that would be freed: ${this.formatBytes(stats.totalSize)}`);
      
    } catch (err) {
      console.error(`❌ Failed to gather cleanup stats: ${err.message}`);
    }
  }

  /**
   * Perform cleanup of generated files
   */
  async cleanup() {
    console.log("🧹 Starting cleanup...");
    
    try {
      const stats = this.gatherCleanupStats();
      
      if (stats.totalFiles === 0) {
        console.log("✨ No files to clean up!");
        return;
      }
      
      console.log(`📄 Removing ${stats.totalFiles} file(s)...`);
      
      let removedCount = 0;
      
      // Clean work tracking files
      const workTrackingPath = this.getWorkTrackingPath();
      if (fs.existsSync(workTrackingPath)) {
        const files = fs.readdirSync(workTrackingPath).filter(f => f.endsWith('.json'));
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(workTrackingPath, file));
            removedCount++;
          } catch (err) {
            logWarn(`Failed to remove ${file}: ${err.message}`);
          }
        }
      }
      
      // Clean analysis files
      const analysisPath = this.getAnalysisPath();
      if (fs.existsSync(analysisPath)) {
        const files = fs.readdirSync(analysisPath).filter(f => f.endsWith('.json'));
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(analysisPath, file));
            removedCount++;
          } catch (err) {
            logWarn(`Failed to remove ${file}: ${err.message}`);
          }
        }
      }
      
      console.log(`✅ Cleanup completed! Removed ${removedCount} file(s).`);
      logInfo(`Cleanup completed: ${removedCount} files removed`);
      
    } catch (err) {
      console.error(`❌ Cleanup failed: ${err.message}`);
      logError(`Cleanup failed: ${err.message}`);
    }
  }

  /**
   * Gather cleanup statistics
   */
  gatherCleanupStats() {
    const stats = {
      directories: {},
      totalFiles: 0,
      totalSize: 0
    };
    
    const dirsToCheck = [
      { name: "Work Tracking", path: this.getWorkTrackingPath() },
      { name: "Analysis", path: this.getAnalysisPath() }
    ];
    
    for (const dir of dirsToCheck) {
      if (fs.existsSync(dir.path)) {
        const files = fs.readdirSync(dir.path).filter(f => f.endsWith('.json'));
        stats.directories[dir.name] = files.length;
        stats.totalFiles += files.length;
        
        // Calculate total size
        for (const file of files) {
          try {
            const stat = fs.statSync(path.join(dir.path, file));
            stats.totalSize += stat.size;
          } catch (err) {
            // Ignore errors for individual files
          }
        }
      } else {
        stats.directories[dir.name] = 0;
      }
    }
    
    return stats;
  }

  /**
   * Get work tracking directory path
   */
  getWorkTrackingPath() {
    if (config.app.testMode) {
      return config.paths.test.workTracking;
    } else {
      return config.paths.production.workTracking;
    }
  }

  /**
   * Get analysis directory path
   */
  getAnalysisPath() {
    if (config.app.testMode) {
      return path.join(config.paths.test.baseDirectory, "test_data", "analysis");
    } else {
      return path.join(config.paths.production.baseDirectory, "analysis");
    }
  }

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = CleanupService;