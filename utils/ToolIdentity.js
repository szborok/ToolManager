// utils/ToolIdentity.js
/**
 * Tool Identity utilities
 * Provides tool identification based on matrix code and tool type classification
 */

const path = require('path');
const fs = require('fs');

// Load matrix tool definitions
const DEFINITIONS_PATH = path.join(__dirname, '..', 'config', 'matrix-tool-definitions.json');
let matrixDefinitions = null;

try {
  matrixDefinitions = JSON.parse(fs.readFileSync(DEFINITIONS_PATH, 'utf8'));
} catch (error) {
  console.error('Failed to load matrix tool definitions:', error.message);
}

const ToolCategory = {
  // Matrix Tools (Monitored Inventory)
  MATRIX_ECUT: "MATRIX_ECUT",
  MATRIX_MFC: "MATRIX_MFC", 
  MATRIX_XF: "MATRIX_XF",
  MATRIX_XFEED: "MATRIX_XFEED",
  
  // Non-Matrix Tools (Usage Tracking Only)
  NON_MATRIX: "NON_MATRIX",
  
  // Unknown/Unclassified
  UNKNOWN: "UNKNOWN"
};

/**
 * Determine tool category from matrix code using loaded definitions
 * @param {string} matrixCode - Tool matrix code (e.g., "RT-8400300")
 * @returns {object} Tool classification with category and details
 */
function getToolIdentityFromMatrixCode(matrixCode) {
  if (!matrixCode || typeof matrixCode !== 'string') {
    return {
      category: ToolCategory.UNKNOWN,
      isMatrixTool: false,
      hasInventoryTracking: false
    };
  }

  const code = matrixCode.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Check if definitions are loaded
  if (!matrixDefinitions || !matrixDefinitions.categories) {
    console.warn('Matrix definitions not loaded, using fallback detection');
    return fallbackDetection(code);
  }

  // Check each category from definitions
  for (const [categoryKey, categoryData] of Object.entries(matrixDefinitions.categories)) {
    for (const pattern of categoryData.codePatterns) {
      if (code.includes(pattern)) {
        return {
          category: `MATRIX_${categoryKey}`,
          isMatrixTool: true,
          hasInventoryTracking: true,
          toolType: categoryData.description,
          codePattern: pattern
        };
      }
    }
  }

  // Non-Matrix Tools (everything else)
  return {
    category: ToolCategory.NON_MATRIX,
    isMatrixTool: false,
    hasInventoryTracking: false,
    toolType: 'Other Tools'
  };
}

/**
 * Fallback detection if definitions file is not available
 * @param {string} code - Cleaned tool code
 * @returns {object} Tool classification
 */
function fallbackDetection(code) {
  // Matrix Tools - ECUT (Tool codes: 8400xxx, 8410xxx, 8420xxx)
  if (code.includes('8400') || code.includes('8410') || code.includes('8420')) {
    return {
      category: ToolCategory.MATRIX_ECUT,
      isMatrixTool: true,
      hasInventoryTracking: true,
      toolType: 'End Cutting Tools'
    };
  }

  // Matrix Tools - MFC (Tool codes: 8201xxx, 8211xxx, 8221xxx)
  if (code.includes('8201') || code.includes('8211') || code.includes('8221')) {
    return {
      category: ToolCategory.MATRIX_MFC,
      isMatrixTool: true,
      hasInventoryTracking: true,
      toolType: 'Multi-Functional Cutting Tools'
    };
  }

  // Matrix Tools - XF (Tool codes: 1525xxx, 8521xxx)
  if (code.includes('1525') || code.includes('8521')) {
    return {
      category: ToolCategory.MATRIX_XF,
      isMatrixTool: true,
      hasInventoryTracking: true,
      toolType: 'Finishing Tools'
    };
  }

  // Matrix Tools - XFEED (Tool codes: 7620xxx, 7624xxx)
  if (code.includes('7620') || code.includes('7624')) {
    return {
      category: ToolCategory.MATRIX_XFEED,
      isMatrixTool: true,
      hasInventoryTracking: true,
      toolType: 'Feed/Drilling Tools'
    };
  }

  // Non-Matrix Tools (everything else)
  return {
    category: ToolCategory.NON_MATRIX,
    isMatrixTool: false,
    hasInventoryTracking: false,
    toolType: 'Other Tools'
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getToolIdentityFromMatrixCode instead
 */
function getToolIdentityFromDiameterAndToolCode(diameter, toolCode) {
  // Try to construct a matrix code from the tool code
  const matrixCode = `RT-${toolCode}`;
  const identity = getToolIdentityFromMatrixCode(matrixCode);
  
  // Return legacy format
  switch (identity.category) {
    case ToolCategory.MATRIX_ECUT: return "ECUT";
    case ToolCategory.MATRIX_MFC: return "MFC";
    case ToolCategory.MATRIX_XF: return "XF";
    case ToolCategory.MATRIX_XFEED: return "XFEED";
    default: return "UNKNOWN";
  }
}

// Freeze the objects to prevent modifications
Object.freeze(ToolCategory);

module.exports = {
  ToolCategory,
  getToolIdentityFromMatrixCode,
  getToolIdentityFromDiameterAndToolCode // Legacy compatibility
};
