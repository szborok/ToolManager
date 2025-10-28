// utils/ToolIdentity.js
/**
 * Tool Identity utilities
 * Provides tool identification based on diameter and tool code
 */

const ToolIdentity = {
  ECUT: "ECUT",
  MFC: "MFC",
  XF: "XF",
  XFEED: "XFEED",
  UNKNOWN: "UNKNOWN",
};

/**
 * Determine tool identity from diameter and tool code
 * @param {number} diameter - Tool diameter
 * @param {number} toolCode - Tool code
 * @returns {string} Tool identity
 */
function getToolIdentityFromDiameterAndToolCode(diameter, toolCode) {
  // Convert to strings for comparison
  const diameterStr = diameter.toString();
  const toolCodeStr = toolCode.toString();

  // ECUT tools - typically smaller diameters
  if (diameter <= 6) {
    return ToolIdentity.ECUT;
  }

  // XF tools - finishing tools
  if (diameter >= 8 && diameter <= 20) {
    return ToolIdentity.XF;
  }

  // MFC tools - multi-functional cutting
  if (diameter > 20 && diameter <= 50) {
    return ToolIdentity.MFC;
  }

  // XFEED tools - larger drilling/feeding tools
  if (diameter > 50) {
    return ToolIdentity.XFEED;
  }

  // Default for unmatched cases
  return ToolIdentity.UNKNOWN;
}

// Freeze the object to prevent modifications
Object.freeze(ToolIdentity);

module.exports = {
  ToolIdentity,
  getToolIdentityFromDiameterAndToolCode,
};
