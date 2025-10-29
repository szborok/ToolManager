// utils/ToolState.js
/**
 * Tool State enumeration
 * Represents the current state of a cutting tool
 */

const ToolState = {
  FREE: "FREE",               // Tool is available and unused
  IN_USE: "IN_USE",           // Tool is currently being used within normal limits
  OVERRUN: "OVERRUN",         // Tool has exceeded normal time but within overrun allowance  
  EXPIRED: "EXPIRED",         // Tool has exceeded maximum time with overrun
  
  // Legacy states for compatibility
  MAXED: "EXPIRED",           // Alias for EXPIRED
  IN_DEBT: "EXPIRED",         // Alias for EXPIRED
};

// Freeze the object to prevent modifications
Object.freeze(ToolState);

module.exports = ToolState;
