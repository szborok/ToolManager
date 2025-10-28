// utils/ToolState.js
/**
 * Tool State enumeration
 * Represents the current state of a cutting tool
 */

const ToolState = {
  FREE: "FREE",
  IN_USE: "IN_USE",
  MAXED: "MAXED",
  IN_DEBT: "IN_DEBT",
};

// Freeze the object to prevent modifications
Object.freeze(ToolState);

module.exports = ToolState;
