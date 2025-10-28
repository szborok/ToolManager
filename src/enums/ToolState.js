// src/enums/ToolState.js
/**
 * Tool state enumeration
 * Represents the various states a tool can be in
 */
const ToolState = Object.freeze({
  FREE: 'FREE',
  INUSE: 'INUSE', 
  MAXED: 'MAXED',
  INDEBT: 'INDEBT'
});

module.exports = ToolState;