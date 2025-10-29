// path: src/Results.js
/**
 * The Results class handles saving analysis results to a single consolidated report file.
 * Unlike json_scanner which saves results next to each JSON, ToolManager creates one comprehensive report.
 */

const fs = require("fs");
const path = require("path");
const config = require("../config");
const Logger = require("../utils/Logger");
const FileUtils = require("../utils/FileUtils");

class Results {
  constructor() {}

  /**
   * Generate simplified report with tools used and matrix inventory
   * This is called from the new workflow in Scanner.js
   */
  async generateConsolidatedReport(excelData, processedJsonData) {
    try {
      Logger.info("📋 Generating simplified tool report...");

      // Get list of tools actually used in JSON files
      const toolsUsedList = this.createToolsUsedList(processedJsonData);
      const usedToolNames = new Set(toolsUsedList.map(tool => tool.toolName));

      // Split matrix inventory into used and unused tools
      const { usedTools, unusedTools } = this.splitMatrixInventory(excelData, usedToolNames);
      
      // Create set of matrix tool codes for filtering
      const matrixToolCodes = new Set(
        excelData && excelData.toolInventory 
          ? excelData.toolInventory.map(tool => tool.toolCode)
          : []
      );

      const reportData = {
        reportInfo: {
          generatedAt: new Date().toISOString(),
          scanAttempt: 1,
          jsonDateRange: this.getJsonDateRange(processedJsonData),
          summary: {
            excelFilesProcessed: excelData ? 1 : 0,
            jsonFilesProcessed: processedJsonData ? processedJsonData.length : 0,
            matrixToolsUsed: usedTools.length,
            nonMatrixToolsUsed: toolsUsedList.length - usedTools.length
          }
        },

        // Section 1: Matrix Tools (tools found in BOTH Excel inventory AND JSON files)
        matrixTools: this.createMatrixToolsList(toolsUsedList, usedTools),

        // Section 2: Non-Matrix Tools (tools found in JSON but NOT in Excel inventory)
        nonMatrixTools: this.createNonMatrixToolsList(toolsUsedList, matrixToolCodes)
      };

      // Save simplified report in project root
      const projectRoot = path.join(__dirname, '..');
      const reportFileName = `ToolManager_Result.json`;
      const reportFilePath = path.join(projectRoot, reportFileName);

      FileUtils.writeJsonFile(reportFilePath, reportData);
      Logger.info(`✅ Simplified report saved: ${reportFileName}`);

      return reportData;

    } catch (err) {
      Logger.error(`Failed to generate simplified report: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get date range of JSON files used for analysis
   */
  getJsonDateRange(processedJsonData) {
    if (!processedJsonData || processedJsonData.length === 0) {
      return {
        firstJsonCompleteDate: null,
        lastJsonCompleteDate: null,
        totalDaysSpan: 0,
        jsonFilesUsed: []
      };
    }

    // Extract dates from JSON file names or processed data
    // Assuming the file names contain date information or we can get it from the data
    const dates = [];
    const fileNames = [];
    
    for (const jsonData of processedJsonData) {
      // Add file name to the list
      fileNames.push(jsonData.fileName);
      
      // Try to extract date from filename (e.g., W5270NS01001A.json)
      // Or use the processedAt timestamp if available
      if (jsonData.processedAt) {
        dates.push(new Date(jsonData.processedAt));
      } else {
        // Fallback: use current date for files without timestamp
        dates.push(new Date());
      }
    }

    if (dates.length === 0) {
      return {
        firstJsonCompleteDate: null,
        lastJsonCompleteDate: null,
        totalDaysSpan: 0,
        jsonFilesUsed: fileNames
      };
    }

    // Sort dates to find first and last
    dates.sort((a, b) => a - b);
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    // Calculate span in days
    const diffTime = Math.abs(lastDate - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      firstJsonCompleteDate: firstDate.toISOString(),
      lastJsonCompleteDate: lastDate.toISOString(),
      totalDaysSpan: diffDays,
      jsonFilesUsed: fileNames.sort() // Sort alphabetically for consistency
    };
  }

  /**
   * Split matrix inventory into used and unused tools based on JSON usage
   */
  splitMatrixInventory(excelData, usedToolNames) {
    if (!excelData || !excelData.toolInventory || excelData.toolInventory.length === 0) {
      return { usedTools: [], unusedTools: [] };
    }

    const usedTools = [];
    const unusedTools = [];

    for (const tool of excelData.toolInventory) {
      const toolCode = tool.toolCode;
      const quantity = parseFloat(tool.quantity || 0);
      const toolLifeMinutes = this.getToolLifeMinutes(toolCode, tool.description);
      const totalCapacity = quantity * toolLifeMinutes;

      const toolData = {
        toolCode: toolCode,
        description: tool.description || '',
        quantity: quantity,
        toolLifePerPiece: toolLifeMinutes,
        totalCapacityMinutes: Math.round(totalCapacity * 100) / 100
      };

      // Check if this tool is used in production (found in JSON files)
      if (usedToolNames.has(toolCode)) {
        usedTools.push(toolData);
      } else {
        unusedTools.push(toolData);
      }
    }

    // Sort by total capacity (descending)
    usedTools.sort((a, b) => b.totalCapacityMinutes - a.totalCapacityMinutes);
    unusedTools.sort((a, b) => b.totalCapacityMinutes - a.totalCapacityMinutes);

    return { usedTools, unusedTools };
  }

  /**
   * Create matrix tools list (tools found in BOTH Excel and JSON)
   */
  createMatrixToolsList(toolsUsedList, usedMatrixTools) {
    const matrixToolsMap = {};
    
    // Create lookup map of matrix tools by tool code
    for (const matrixTool of usedMatrixTools) {
      matrixToolsMap[matrixTool.toolCode] = matrixTool;
    }

    const matrixTools = [];

    // Find tools that exist in both JSON usage and Excel inventory
    for (const usedTool of toolsUsedList) {
      const matrixTool = matrixToolsMap[usedTool.toolName];
      if (matrixTool) {
        matrixTools.push({
          toolCode: usedTool.toolName,
          description: matrixTool.description,
          // Usage data from JSON
          totalUsageTime: usedTool.totalUsageTime,
          usageCount: usedTool.usageCount,
          projectCount: usedTool.projectCount,
          // Inventory data from Excel
          quantity: matrixTool.quantity,
          toolLifePerPiece: matrixTool.toolLifePerPiece,
          totalCapacityMinutes: matrixTool.totalCapacityMinutes,
          // Analysis
          utilizationPercentage: matrixTool.totalCapacityMinutes > 0 
            ? Math.round((usedTool.totalUsageTime / matrixTool.totalCapacityMinutes) * 10000) / 100
            : 0,
          remainingCapacity: Math.max(0, matrixTool.totalCapacityMinutes - usedTool.totalUsageTime)
        });
      }
    }

    // Sort by usage time (descending)
    matrixTools.sort((a, b) => b.totalUsageTime - a.totalUsageTime);

    return matrixTools;
  }

  /**
   * Create non-matrix tools list (tools found in JSON but NOT in Excel)
   */
  createNonMatrixToolsList(toolsUsedList, matrixToolCodes) {
    const nonMatrixTools = [];

    // Find tools that are used in production but not in Excel inventory
    for (const usedTool of toolsUsedList) {
      // If tool is not in the matrix inventory, it's a non-matrix tool
      if (!matrixToolCodes.has(usedTool.toolName)) {
        nonMatrixTools.push({
          toolName: usedTool.toolName,
          totalUsageTime: usedTool.totalUsageTime,
          usageCount: usedTool.usageCount,
          projectCount: usedTool.projectCount,
          status: "NOT_IN_MATRIX"
        });
      }
    }

    // Sort by usage time (descending)
    nonMatrixTools.sort((a, b) => b.totalUsageTime - a.totalUsageTime);

    return nonMatrixTools;
  }

  /**
   * Create simplified tools used list from JSON analysis
   */
  createToolsUsedList(processedJsonData) {
    if (!processedJsonData || processedJsonData.length === 0) {
      return [];
    }

    const toolUsageMap = {};

    // Aggregate tool usage across all projects
    for (const projectData of processedJsonData) {
      for (const operation of projectData.toolUsage.operations) {
        const toolName = operation.toolName;
        if (toolName && toolName !== 'UNKNOWN') {
          if (!toolUsageMap[toolName]) {
            toolUsageMap[toolName] = {
              toolName: toolName,
              totalUsageTime: 0,
              usageCount: 0,
              projectsUsedIn: new Set()
            };
          }
          
          toolUsageMap[toolName].totalUsageTime += operation.operationTime || 0;
          toolUsageMap[toolName].usageCount += 1;
          toolUsageMap[toolName].projectsUsedIn.add(projectData.toolUsage.project);
        }
      }
    }

    // Convert to array and format for output
    const toolsUsedList = Object.values(toolUsageMap).map(tool => ({
      toolName: tool.toolName,
      totalUsageTime: Math.round(tool.totalUsageTime * 100) / 100, // Round to 2 decimal places
      usageCount: tool.usageCount,
      projectCount: tool.projectsUsedIn.size
    }));

    // Sort by usage time (descending)
    toolsUsedList.sort((a, b) => b.totalUsageTime - a.totalUsageTime);

    return toolsUsedList;
  }

  /**
   * Create matrix inventory list with capacity calculation (quantity × tool life)
   */
  createMatrixInventoryList(excelData) {
    if (!excelData || !excelData.toolInventory || excelData.toolInventory.length === 0) {
      return [];
    }

    const matrixList = excelData.toolInventory.map(tool => {
      const quantity = parseFloat(tool.quantity || 0);
      const toolLifeMinutes = this.getToolLifeMinutes(tool.toolCode || tool.code, tool.description);
      const totalCapacity = quantity * toolLifeMinutes;

      return {
        toolCode: tool.toolCode || tool.code || 'UNKNOWN',
        description: tool.description || '',
        quantity: quantity,
        toolLifePerPiece: toolLifeMinutes,
        totalCapacityMinutes: Math.round(totalCapacity * 100) / 100
      };
    });

    // Sort by total capacity (descending)
    matrixList.sort((a, b) => b.totalCapacityMinutes - a.totalCapacityMinutes);

    return matrixList;
  }

  /**
   * Get tool life in minutes based on tool code and description
   * This is a simplified estimation - you can enhance this with actual tool life data
   */
  getToolLifeMinutes(toolCode, description) {
    // Default tool life is 60 minutes
    let baseLife = 60;

    // Extract diameter from tool code or description for better estimation
    const diameter = this.extractDiameterFromTool(toolCode, description);
    
    if (diameter && diameter > 0) {
      // Larger tools generally have longer life
      // This is a simple estimation - adjust based on your actual tool data
      if (diameter >= 20) baseLife = 120;
      else if (diameter >= 15) baseLife = 90;
      else if (diameter >= 10) baseLife = 75;
      else if (diameter >= 5) baseLife = 60;
      else baseLife = 45;
    }

    // Tool type specific adjustments
    if (toolCode) {
      const codeUpper = toolCode.toUpperCase();
      
      // Drilling tools typically have longer life
      if (codeUpper.includes('BHF') || codeUpper.includes('DRILL')) {
        baseLife *= 1.5;
      }
      // End mills have standard life
      else if (codeUpper.includes('VLM') || codeUpper.includes('MILL')) {
        baseLife *= 1.0;
      }
      // Tapping tools have shorter life due to higher stress
      else if (codeUpper.includes('TAP') || codeUpper.includes('MF')) {
        baseLife *= 0.8;
      }
      // Face mills have longer life
      else if (codeUpper.includes('KPF') || codeUpper.includes('FACE')) {
        baseLife *= 1.3;
      }
    }

    return Math.round(baseLife);
  }

  /**
   * Extract diameter from tool code or description
   */
  extractDiameterFromTool(toolCode, description) {
    // Try to extract from description first (more reliable)
    if (description) {
      const match = description.match(/ø?(\d+[,.]?\d*)/);
      if (match) {
        return parseFloat(match[1].replace(',', '.'));
      }
    }

    // Try to extract from tool code
    if (toolCode) {
      // Look for D followed by number (e.g., D10, D8.5)
      const match = toolCode.match(/D(\d+[,.]?\d*)/i);
      if (match) {
        return parseFloat(match[1].replace(',', '.'));
      }
      
      // Look for S followed by number (e.g., S8R0, S10.3)
      const sMatch = toolCode.match(/S(\d+[,.]?\d*)/i);
      if (sMatch) {
        return parseFloat(sMatch[1].replace(',', '.'));
      }
    }

    return null;
  }

  /**
   * Process Excel data for the report
   */
  processExcelData(excelData) {
    if (!excelData) {
      return {
        fileName: null,
        processedAt: null,
        toolCount: 0,
        tools: []
      };
    }

    return {
      fileName: excelData.fileName,
      processedAt: excelData.processedAt,
      toolCount: excelData.toolInventory ? excelData.toolInventory.length : 0,
      tools: excelData.toolInventory || []
    };
  }

  /**
   * Process JSON usage data for the report
   */
  processJsonUsageData(processedJsonData) {
    if (!processedJsonData || processedJsonData.length === 0) {
      return {
        totalProjects: 0,
        totalOperations: 0,
        totalMachiningTime: 0,
        uniqueToolsUsed: 0,
        projectSummaries: [],
        toolUsageSummary: {}
      };
    }

    const summary = {
      totalProjects: processedJsonData.length,
      totalOperations: 0,
      totalMachiningTime: 0,
      uniqueToolsUsed: 0,
      projectSummaries: [],
      toolUsageSummary: {}
    };

    const allToolsUsed = new Set();

    for (const projectData of processedJsonData) {
      const projectSummary = {
        fileName: projectData.fileName,
        project: projectData.toolUsage.project,
        position: projectData.toolUsage.position,
        machine: projectData.toolUsage.machine,
        operator: projectData.toolUsage.operator,
        operationCount: projectData.toolUsage.operations.length,
        totalTime: projectData.toolUsage.totalTime,
        toolsUsed: projectData.toolUsage.toolsUsed
      };

      summary.projectSummaries.push(projectSummary);
      summary.totalOperations += projectSummary.operationCount;
      summary.totalMachiningTime += projectSummary.totalTime;

      // Collect all tools used
      for (const toolName of projectData.toolUsage.toolsUsed) {
        allToolsUsed.add(toolName);
        
        if (!summary.toolUsageSummary[toolName]) {
          summary.toolUsageSummary[toolName] = {
            totalUsageTime: 0,
            operationCount: 0,
            projectsUsedIn: []
          };
        }
        
        // Find usage time for this tool in this project
        const toolOperations = projectData.toolUsage.operations.filter(op => op.toolName === toolName);
        const toolTime = toolOperations.reduce((sum, op) => sum + op.operationTime, 0);
        
        summary.toolUsageSummary[toolName].totalUsageTime += toolTime;
        summary.toolUsageSummary[toolName].operationCount += toolOperations.length;
        summary.toolUsageSummary[toolName].projectsUsedIn.push({
          project: projectData.toolUsage.project,
          position: projectData.toolUsage.position,
          usageTime: toolTime
        });
      }
    }

    summary.uniqueToolsUsed = allToolsUsed.size;
    
    return summary;
  }

  /**
   * Create combined analysis comparing Excel inventory with JSON usage
   */
  createCombinedAnalysis(excelData, processedJsonData) {
    const analysis = {
      inventoryVsUsage: {},
      recommendations: [],
      alerts: []
    };

    // This is where you would compare Excel tool inventory with JSON usage patterns
    // For now, provide a basic structure
    
    if (excelData && excelData.toolInventory && processedJsonData) {
      const inventoryTools = excelData.toolInventory.map(tool => tool.toolCode || tool.code);
      const usedTools = new Set();
      
      for (const projectData of processedJsonData) {
        for (const toolName of projectData.toolUsage.toolsUsed) {
          usedTools.add(toolName);
        }
      }

      analysis.inventoryVsUsage = {
        toolsInInventory: inventoryTools.length,
        toolsActuallyUsed: usedTools.size,
        commonTools: inventoryTools.filter(tool => usedTools.has(tool)),
        unusedInventory: inventoryTools.filter(tool => !usedTools.has(tool)),
        missingFromInventory: Array.from(usedTools).filter(tool => !inventoryTools.includes(tool))
      };

      // Generate recommendations
      if (analysis.inventoryVsUsage.unusedInventory.length > 0) {
        analysis.recommendations.push(`Consider reviewing ${analysis.inventoryVsUsage.unusedInventory.length} unused tools in inventory`);
      }
      
      if (analysis.inventoryVsUsage.missingFromInventory.length > 0) {
        analysis.alerts.push(`${analysis.inventoryVsUsage.missingFromInventory.length} tools used in production but not found in inventory`);
      }
    }

    return analysis;
  }

  /**
   * Save consolidated analysis results to a single report file.
   * @param {Array} projects - All processed projects
   * @param {Object} allAnalysisResults - Combined analysis results
   */
  saveConsolidatedResults(projects, allAnalysisResults) {
    try {
      Logger.info("Creating consolidated ToolManager report...");

      const reportData = {
        reportInfo: {
          generatedAt: new Date().toISOString(),
          toolManagerVersion: "1.0.0",
          projectsProcessed: projects.length,
          jsonFilesAnalyzed: allAnalysisResults.totalJsonFiles || 0
        },
        
        // Section 1: Tool Usage Summary (from JSON analysis)
        toolUsageSummary: this.createToolUsageSummary(allAnalysisResults),
        
        // Section 2: Matrix Inventory (from Excel, consolidated duplicates)
        matrixInventory: this.createMatrixInventory(allAnalysisResults),
        
        // Section 3: Tool Life vs Machining Time Comparison
        toolLifeComparison: this.createToolLifeComparison(allAnalysisResults)
      };

      // Save to results directory
      const resultsPath = this.getResultsPath();
      FileUtils.ensureDirectoryExists(resultsPath);
      
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const reportFileName = `ToolManager_Report_${timestamp}.json`;
      const reportFilePath = path.join(resultsPath, reportFileName);

      FileUtils.writeJsonFile(reportFilePath, reportData);
      Logger.info(`✓ Consolidated report saved: ${reportFileName}`);

      // Also save a "latest" version for easy access
      const latestReportPath = path.join(resultsPath, "ToolManager_Latest_Report.json");
      FileUtils.writeJsonFile(latestReportPath, reportData);
      Logger.info("✓ Latest report updated");

    } catch (err) {
      Logger.error(`Failed to save consolidated results: ${err.message}`);
    }
  }

  /**
   * Create Section 1: Tool Usage Summary from JSON analysis
   * All tools and machining/working time summarized
   */
  createToolUsageSummary(analysisResults) {
    const summary = {
      totalMachiningTimeMinutes: 0,
      totalJobsAnalyzed: 0,
      toolsUsed: {},
      machineUsage: {}
    };

    // Process all tool usage data from JSON files
    if (analysisResults.toolUsage) {
      for (const [toolCode, usage] of Object.entries(analysisResults.toolUsage)) {
        summary.toolsUsed[toolCode] = {
          totalUsageTime: usage.totalTime || 0,
          operationCount: usage.operations || 0,
          projects: usage.projects || [],
          averageTimePerOperation: usage.operations > 0 ? (usage.totalTime / usage.operations) : 0
        };
        summary.totalMachiningTimeMinutes += usage.totalTime || 0;
      }
    }

    summary.totalJobsAnalyzed = analysisResults.totalJobs || 0;
    
    return summary;
  }

  /**
   * Create Section 2: Matrix Inventory with duplicate consolidation
   * Handle cases like RT-8400501 appearing multiple times
   */
  createMatrixInventory(analysisResults) {
    const inventory = {
      consolidatedTools: {},
      duplicatesFound: [],
      totalUniqueTools: 0,
      totalInventoryQuantity: 0
    };

    // Process matrix data and consolidate duplicates
    if (analysisResults.matrixData) {
      for (const tool of analysisResults.matrixData) {
        const toolCode = tool.code || tool.toolCode;
        const quantity = parseFloat(tool.quantity || 0);

        if (inventory.consolidatedTools[toolCode]) {
          // Duplicate found - consolidate
          inventory.consolidatedTools[toolCode].quantity += quantity;
          inventory.consolidatedTools[toolCode].duplicateEntries.push({
            originalEntry: tool,
            quantity: quantity
          });
          
          if (!inventory.duplicatesFound.includes(toolCode)) {
            inventory.duplicatesFound.push(toolCode);
          }
        } else {
          // First occurrence
          inventory.consolidatedTools[toolCode] = {
            toolCode: toolCode,
            description: tool.description || '',
            diameter: tool.diameter || '',
            specification: tool.specification || '',
            quantity: quantity,
            duplicateEntries: []
          };
        }
        
        inventory.totalInventoryQuantity += quantity;
      }
    }

    inventory.totalUniqueTools = Object.keys(inventory.consolidatedTools).length;
    
    return inventory;
  }

  /**
   * Create Section 3: Tool Life vs Machining Time Comparison
   * Compare tool life to total machining time by tool type/diameter
   */
  createToolLifeComparison(analysisResults) {
    const comparison = {
      toolTypeAnalysis: {},
      overallMetrics: {
        totalToolLifeMinutes: 0,
        totalMachiningTimeMinutes: 0,
        efficiencyRatio: 0
      }
    };

    // Group tools by type/diameter for comparison
    const toolGroups = this.groupToolsByTypeAndDiameter(analysisResults);

    for (const [groupKey, group] of Object.entries(toolGroups)) {
      const totalInventoryQuantity = group.inventory.reduce((sum, tool) => sum + tool.quantity, 0);
      const totalUsageTime = group.usage.reduce((sum, usage) => sum + usage.totalTime, 0);
      const estimatedToolLifePerPiece = this.estimateToolLife(group.toolType, group.diameter);
      const totalToolLifeCapacity = totalInventoryQuantity * estimatedToolLifePerPiece;

      comparison.toolTypeAnalysis[groupKey] = {
        toolType: group.toolType,
        diameter: group.diameter,
        inventoryQuantity: totalInventoryQuantity,
        totalUsageTimeMinutes: totalUsageTime,
        estimatedToolLifePerPieceMinutes: estimatedToolLifePerPiece,
        totalToolLifeCapacityMinutes: totalToolLifeCapacity,
        utilizationPercentage: totalToolLifeCapacity > 0 ? (totalUsageTime / totalToolLifeCapacity) * 100 : 0,
        remainingCapacityMinutes: Math.max(0, totalToolLifeCapacity - totalUsageTime),
        status: this.determineToolStatus(totalUsageTime, totalToolLifeCapacity)
      };

      comparison.overallMetrics.totalToolLifeMinutes += totalToolLifeCapacity;
      comparison.overallMetrics.totalMachiningTimeMinutes += totalUsageTime;
    }

    comparison.overallMetrics.efficiencyRatio = comparison.overallMetrics.totalToolLifeMinutes > 0 
      ? (comparison.overallMetrics.totalMachiningTimeMinutes / comparison.overallMetrics.totalToolLifeMinutes) * 100 
      : 0;

    return comparison;
  }

  /**
   * Group tools by type and diameter for comparison analysis
   */
  groupToolsByTypeAndDiameter(analysisResults) {
    const groups = {};

    // Process matrix inventory
    if (analysisResults.matrixData) {
      for (const tool of analysisResults.matrixData) {
        const groupKey = this.createToolGroupKey(tool);
        if (!groups[groupKey]) {
          groups[groupKey] = {
            toolType: this.extractToolType(tool.code),
            diameter: this.extractDiameter(tool.description || tool.specification),
            inventory: [],
            usage: []
          };
        }
        groups[groupKey].inventory.push(tool);
      }
    }

    // Process usage data
    if (analysisResults.toolUsage) {
      for (const [toolCode, usage] of Object.entries(analysisResults.toolUsage)) {
        const groupKey = this.createToolGroupKeyFromCode(toolCode);
        if (groups[groupKey]) {
          groups[groupKey].usage.push(usage);
        }
      }
    }

    return groups;
  }

  /**
   * Create a group key for tool type and diameter
   */
  createToolGroupKey(tool) {
    const toolType = this.extractToolType(tool.code);
    const diameter = this.extractDiameter(tool.description || tool.specification);
    return `${toolType}_${diameter}`;
  }

  createToolGroupKeyFromCode(toolCode) {
    const toolType = this.extractToolType(toolCode);
    // Try to extract diameter from tool code pattern
    const diameter = this.extractDiameterFromCode(toolCode);
    return `${toolType}_${diameter}`;
  }

  /**
   * Extract tool type from tool code (e.g., RT-8400300 -> RT-8400)
   */
  extractToolType(toolCode) {
    if (!toolCode) return 'UNKNOWN';
    const match = toolCode.match(/^([A-Z]+-\d+)/);
    return match ? match[1] : toolCode.split('_')[0];
  }

  /**
   * Extract diameter from description (e.g., "ø5,7/6x56/12 r0.1 z4" -> 5.7)
   */
  extractDiameter(description) {
    if (!description) return 'UNKNOWN';
    const match = description.match(/ø(\d+[,.]?\d*)/);
    return match ? parseFloat(match[1].replace(',', '.')) : 'UNKNOWN';
  }

  /**
   * Extract diameter from tool code pattern
   */
  extractDiameterFromCode(toolCode) {
    // This would need to be customized based on your tool code patterns
    // For now, return UNKNOWN and rely on matrix description
    return 'UNKNOWN';
  }

  /**
   * Estimate tool life based on tool type and diameter
   */
  estimateToolLife(toolType, diameter) {
    // Basic estimation - this should be customized based on actual tool specifications
    const baseLife = 60; // 60 minutes base life
    const diameterFactor = typeof diameter === 'number' ? Math.max(1, diameter / 5) : 1;
    return baseLife * diameterFactor;
  }

  /**
   * Determine tool status based on usage vs capacity
   */
  determineToolStatus(usageTime, capacity) {
    if (capacity === 0) return 'NO_INVENTORY';
    const utilization = (usageTime / capacity) * 100;
    
    if (utilization >= 90) return 'CRITICAL';
    if (utilization >= 75) return 'WARNING';
    if (utilization >= 50) return 'NORMAL';
    return 'UNDERUTILIZED';
  }

  /**
   * Get the results directory path.
   * @returns {string} Results path
   */
  getResultsPath() {
    if (config.app.testMode) {
      return config.paths.test.analysis;
    } else {
      return config.paths.production.analysis;
    }
  }
}

module.exports = Results;