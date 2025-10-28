// src/ToolLogic.js
/**
 * Tool logic service for business operations
 * Equivalent to Java ToolLogic class
 */
const Matrix = require("./Matrix");
const ToolState = require("../utils/ToolState");
const Logger = require("../utils/Logger");

class ToolLogic {
  /**
   * Find best available tool for a job
   * @param {number} diameter - Required diameter
   * @param {number} toolCode - Required tool code
   * @param {number} requiredTime - Required cutting time
   * @returns {Object} - Result with tool or recommendation
   */
  findBestToolForJob(diameter, toolCode, requiredTime) {
    try {
      Logger.info(
        `Finding best tool for: D${diameter} P${toolCode}, time: ${requiredTime}min`
      );

      // Find all tools matching diameter and code
      const matchingTools = Matrix.getAllTools().filter(
        (tool) => tool.diameter === diameter && tool.toolCode === toolCode
      );

      if (matchingTools.length === 0) {
        return {
          success: false,
          reason: "NO_MATCHING_TOOLS",
          message: `No tools found with D${diameter} P${toolCode}`,
        };
      }

      // Find tools that can handle the required time
      const capableTools = matchingTools.filter((tool) =>
        tool.canHandleTime(requiredTime)
      );

      if (capableTools.length === 0) {
        return {
          success: false,
          reason: "INSUFFICIENT_TOOL_LIFE",
          message: `No tools have enough remaining life for ${requiredTime} minutes`,
          alternatives: this.findAlternativeTools(
            diameter,
            toolCode,
            requiredTime
          ),
        };
      }

      // Sort by remaining tool life (descending) to use tools with most life first
      capableTools.sort((a, b) => b.getRemainingTime() - a.getRemainingTime());

      const bestTool = capableTools[0];

      return {
        success: true,
        tool: bestTool,
        remainingTime: bestTool.getRemainingTime(),
        message: `Found suitable tool: ${bestTool.toString()}`,
      };
    } catch (error) {
      Logger.error(`Error finding tool: ${error.message}`);
      return {
        success: false,
        reason: "ERROR",
        message: error.message,
      };
    }
  }

  /**
   * Find alternative tools when exact match isn't available
   * @param {number} diameter - Required diameter
   * @param {number} toolCode - Required tool code
   * @param {number} requiredTime - Required cutting time
   * @returns {Array} - Array of alternative suggestions
   */
  findAlternativeTools(diameter, toolCode, requiredTime) {
    const alternatives = [];

    // Find tools with same diameter but different codes
    const sameDiameterTools = Matrix.getAllTools().filter(
      (tool) => tool.diameter === diameter && tool.toolCode !== toolCode
    );

    for (const tool of sameDiameterTools) {
      if (tool.canHandleTime(requiredTime)) {
        alternatives.push({
          tool,
          type: "DIFFERENT_CODE",
          message: `Alternative: D${tool.diameter} P${tool.toolCode}`,
        });
      }
    }

    // Find tools with similar diameter (±0.1)
    const similarDiameterTools = Matrix.getAllTools().filter(
      (tool) =>
        Math.abs(tool.diameter - diameter) <= 0.1 && tool.diameter !== diameter
    );

    for (const tool of similarDiameterTools) {
      if (tool.canHandleTime(requiredTime)) {
        alternatives.push({
          tool,
          type: "SIMILAR_DIAMETER",
          message: `Similar diameter: D${tool.diameter} P${tool.toolCode}`,
        });
      }
    }

    return alternatives.slice(0, 5); // Limit to 5 alternatives
  }

  /**
   * Assign tool to a project and update cutting time
   * @param {Tool} tool - Tool to assign
   * @param {Project} project - Project to assign to
   * @param {number} cuttingTime - Cutting time to add
   * @returns {Object} - Assignment result
   */
  assignToolToProject(tool, project, cuttingTime) {
    try {
      if (!tool.canHandleTime(cuttingTime)) {
        return {
          success: false,
          reason: "INSUFFICIENT_TOOL_LIFE",
          message: `Tool cannot handle ${cuttingTime} minutes (remaining: ${tool.getRemainingTime()})`,
        };
      }

      // Add project to tool
      tool.addProject(project);

      // Add cutting time
      tool.addCuttingTime(cuttingTime);

      Logger.info(
        `Assigned tool ${tool.toString()} to project ${project.getFullId()}`
      );

      return {
        success: true,
        tool,
        project,
        newCurrentTime: tool.currentTime,
        remainingTime: tool.getRemainingTime(),
        newState: tool.toolState,
      };
    } catch (error) {
      Logger.error(`Error assigning tool: ${error.message}`);
      return {
        success: false,
        reason: "ERROR",
        message: error.message,
      };
    }
  }

  /**
   * Get tool utilization statistics
   * @returns {Object} - Utilization statistics
   */
  getToolUtilizationStats() {
    const allTools = Matrix.getAllTools();
    const stats = {
      totalTools: allTools.length,
      averageUtilization: 0,
      utilizationByState: {},
      topUtilizedTools: [],
      underutilizedTools: [],
    };

    if (allTools.length === 0) {
      return stats;
    }

    let totalUtilization = 0;
    const utilizationData = [];

    for (const tool of allTools) {
      const utilization =
        tool.maxTime > 0 ? (tool.currentTime / tool.maxTime) * 100 : 0;
      totalUtilization += utilization;

      utilizationData.push({
        tool,
        utilization,
        state: tool.toolState,
      });

      // Count by state
      if (!stats.utilizationByState[tool.toolState]) {
        stats.utilizationByState[tool.toolState] = 0;
      }
      stats.utilizationByState[tool.toolState]++;
    }

    stats.averageUtilization = totalUtilization / allTools.length;

    // Sort by utilization
    utilizationData.sort((a, b) => b.utilization - a.utilization);

    // Top 5 most utilized
    stats.topUtilizedTools = utilizationData.slice(0, 5);

    // Bottom 5 least utilized (excluding maxed tools)
    const nonMaxedTools = utilizationData.filter(
      (data) => data.state !== ToolState.MAXED
    );
    stats.underutilizedTools = nonMaxedTools.slice(-5).reverse();

    return stats;
  }

  /**
   * Recommend tool maintenance based on usage
   * @returns {Array} - Array of maintenance recommendations
   */
  getMaintenanceRecommendations() {
    const recommendations = [];
    const allTools = Matrix.getAllTools();

    for (const tool of allTools) {
      const utilizationPercent = (tool.currentTime / tool.maxTime) * 100;

      if (tool.toolState === ToolState.MAXED) {
        recommendations.push({
          tool,
          priority: "HIGH",
          action: "REPLACE",
          reason: "Tool has exceeded maximum usage time",
        });
      } else if (utilizationPercent >= 90) {
        recommendations.push({
          tool,
          priority: "MEDIUM",
          action: "PREPARE_REPLACEMENT",
          reason: `Tool is at ${utilizationPercent.toFixed(1)}% capacity`,
        });
      } else if (utilizationPercent >= 75) {
        recommendations.push({
          tool,
          priority: "LOW",
          action: "MONITOR",
          reason: `Tool is at ${utilizationPercent.toFixed(1)}% capacity`,
        });
      }
    }

    // Sort by priority
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    recommendations.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    return recommendations;
  }

  /**
   * Optimize tool allocation for multiple projects
   * @param {Array} projects - Array of projects with requirements
   * @returns {Object} - Optimization result
   */
  optimizeToolAllocation(projects) {
    const allocations = [];
    const conflicts = [];

    // Sort projects by priority or cutting time
    const sortedProjects = [...projects].sort(
      (a, b) =>
        (b.priority || 0) - (a.priority || 0) || a.cuttingTime - b.cuttingTime
    );

    for (const project of sortedProjects) {
      const toolResult = this.findBestToolForJob(
        project.requiredDiameter,
        project.requiredToolCode,
        project.cuttingTime
      );

      if (toolResult.success) {
        const assignmentResult = this.assignToolToProject(
          toolResult.tool,
          project,
          project.cuttingTime
        );

        if (assignmentResult.success) {
          allocations.push(assignmentResult);
        } else {
          conflicts.push({
            project,
            issue: assignmentResult.message,
          });
        }
      } else {
        conflicts.push({
          project,
          issue: toolResult.message,
          alternatives: toolResult.alternatives,
        });
      }
    }

    return {
      allocations,
      conflicts,
      summary: {
        totalProjects: projects.length,
        successfulAllocations: allocations.length,
        conflicts: conflicts.length,
      },
    };
  }
}

module.exports = ToolLogic;
