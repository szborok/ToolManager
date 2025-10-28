// src/config/ToolCategories.js
/**
 * Tool categories configuration with max life and overrun settings
 */

class ToolCategories {
  /**
   * Default tool categories based on the sample Excel structure
   * Each category defines tools that belong to it and their specifications
   */
  static categories = {
    ECUT: {
      name: 'E-Cut Tools',
      description: 'End mills and cutting tools',
      defaultMaxLife: 60, // minutes
      defaultOverrunPercent: 10,
      tools: {
        // These will be populated from sample Excel files
        // Format: "toolCode": { maxLife: minutes, overrunPercent: % }
      }
    },
    
    MFC: {
      name: 'MFC Tools', 
      description: 'Multi-functional cutting tools',
      defaultMaxLife: 45,
      defaultOverrunPercent: 8,
      tools: {}
    },
    
    XF: {
      name: 'XF Tools',
      description: 'XF finishing tools',
      defaultMaxLife: 50,
      defaultOverrunPercent: 12,
      tools: {}
    },
    
    XFEED: {
      name: 'XFeed Tools',
      description: 'XFeed drilling tools',
      defaultMaxLife: 55,
      defaultOverrunPercent: 15,
      tools: {}
    }
  };

  /**
   * Get tool category for a specific tool code
   * @param {string} toolCode - Tool code to look up
   * @returns {Object|null} - Category info or null if not found
   */
  static getToolCategory(toolCode) {
    for (const [categoryKey, category] of Object.entries(this.categories)) {
      if (category.tools[toolCode]) {
        return {
          categoryKey,
          categoryName: category.name,
          toolConfig: category.tools[toolCode],
          defaults: {
            maxLife: category.defaultMaxLife,
            overrunPercent: category.defaultOverrunPercent
          }
        };
      }
    }
    return null;
  }

  /**
   * Get tool specifications (max life, overrun) for a tool code
   * @param {string} toolCode - Tool code
   * @returns {Object} - Tool specifications
   */
  static getToolSpecs(toolCode) {
    const category = this.getToolCategory(toolCode);
    
    if (category) {
      return {
        maxLife: category.toolConfig.maxLife || category.defaults.maxLife,
        overrunPercent: category.toolConfig.overrunPercent || category.defaults.overrunPercent,
        category: category.categoryKey
      };
    }
    
    // Return default specs for unknown tools
    return {
      maxLife: 60, // Default 60 minutes
      overrunPercent: 10, // Default 10% overrun
      category: 'UNKNOWN'
    };
  }

  /**
   * Add tool to a specific category
   * @param {string} categoryKey - Category key (ECUT, MFC, etc.)
   * @param {string} toolCode - Tool code
   * @param {Object} specs - Tool specifications
   */
  static addToolToCategory(categoryKey, toolCode, specs = {}) {
    if (!this.categories[categoryKey]) {
      throw new Error(`Unknown category: ${categoryKey}`);
    }
    
    this.categories[categoryKey].tools[toolCode] = {
      maxLife: specs.maxLife || this.categories[categoryKey].defaultMaxLife,
      overrunPercent: specs.overrunPercent || this.categories[categoryKey].defaultOverrunPercent,
      addedAt: new Date().toISOString()
    };
  }

  /**
   * Get all tools in a category
   * @param {string} categoryKey - Category key
   * @returns {Object} - Tools in category
   */
  static getToolsInCategory(categoryKey) {
    if (!this.categories[categoryKey]) {
      return {};
    }
    return this.categories[categoryKey].tools;
  }

  /**
   * Get category statistics
   * @param {string} categoryKey - Category key
   * @returns {Object} - Category statistics
   */
  static getCategoryStats(categoryKey) {
    if (!this.categories[categoryKey]) {
      return null;
    }
    
    const category = this.categories[categoryKey];
    const toolCount = Object.keys(category.tools).length;
    
    return {
      name: category.name,
      description: category.description,
      toolCount,
      defaultMaxLife: category.defaultMaxLife,
      defaultOverrunPercent: category.defaultOverrunPercent
    };
  }

  /**
   * Load tool categories from configuration file
   * @param {string} configPath - Path to configuration file
   */
  static loadFromConfig(configPath) {
    try {
      const fs = require('fs');
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (configData.toolCategories) {
          this.categories = { ...this.categories, ...configData.toolCategories };
        }
      }
    } catch (error) {
      console.warn(`Failed to load tool categories from ${configPath}: ${error.message}`);
    }
  }

  /**
   * Save tool categories to configuration file
   * @param {string} configPath - Path to configuration file
   */
  static saveToConfig(configPath) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const configData = {
        toolCategories: this.categories,
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    } catch (error) {
      console.error(`Failed to save tool categories to ${configPath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all category keys
   * @returns {Array} - Array of category keys
   */
  static getCategoryKeys() {
    return Object.keys(this.categories);
  }

  /**
   * Check if a tool code is tracked
   * @param {string} toolCode - Tool code to check
   * @returns {boolean} - True if tool is tracked
   */
  static isToolTracked(toolCode) {
    return this.getToolCategory(toolCode) !== null;
  }
}

module.exports = ToolCategories;