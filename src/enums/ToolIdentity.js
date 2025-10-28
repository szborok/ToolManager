// src/enums/ToolIdentity.js
/**
 * Tool identity definitions with diameter, tool code, and max time
 * Equivalent to Java ToolIdentity enum
 */
const ToolIdentity = {
  // ECUT Tools
  RT8400300: { diameter: 5.7, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400300' },
  RT8400391: { diameter: 7.7, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400391' },
  RT8400391_1: { diameter: 7.4, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400391_1' },
  RT8400450: { diameter: 9.7, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400450' },
  RT8400450_1: { diameter: 9.4, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400450_1' },
  RT8400501: { diameter: 11.7, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400501' },
  RT8400501_1: { diameter: 11.4, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400501_1' },
  RT8400610: { diameter: 15.6, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400610' },
  RT8400610_1: { diameter: 15.2, toolCode: 8400, maxToolTime: 60, fullName: 'RT-8400610_1' },
  
  RT8410300: { diameter: 5.7, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410300' },
  RT8410391: { diameter: 7.7, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410391' },
  RT8410391_1: { diameter: 7.4, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410391_1' },
  RT8410450: { diameter: 9.7, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410450' },
  RT8410450_1: { diameter: 9.4, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410450_1' },
  RT8410501: { diameter: 11.7, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410501' },
  RT8410501_1: { diameter: 11.4, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410501_1' },
  RT8410610: { diameter: 15.6, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410610' },
  RT8410610_1: { diameter: 15.2, toolCode: 8410, maxToolTime: 60, fullName: 'RT-8410610_1' },
  
  RT8420300: { diameter: 5.7, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420300' },
  RT8420391: { diameter: 7.7, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420391' },
  RT8420391_1: { diameter: 7.4, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420391_1' },
  RT8420450: { diameter: 9.7, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420450' },
  RT8420450_1: { diameter: 9.4, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420450_1' },
  RT8420501: { diameter: 11.7, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420501' },
  RT8420501_1: { diameter: 11.4, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420501_1' },
  RT8420610: { diameter: 15.6, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420610' },
  RT8420610_1: { diameter: 15.2, toolCode: 8420, maxToolTime: 60, fullName: 'RT-8420610_1' },
  
  // MFC Tools
  RT8201300: { diameter: 5.7, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201300' },
  RT8201391: { diameter: 7.7, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201391' },
  RT8201391_1: { diameter: 7.4, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201391_1' },
  RT8201450: { diameter: 9.7, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201450' },
  RT8201450_1: { diameter: 9.4, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201450_1' },
  RT8201501: { diameter: 11.7, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201501' },
  RT8201501_1: { diameter: 11.4, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201501_1' },
  RT8201610: { diameter: 15.6, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201610' },
  RT8201610_1: { diameter: 15.2, toolCode: 8201, maxToolTime: 60, fullName: 'RT-8201610_1' },
  
  RT8211300: { diameter: 5.7, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211300' },
  RT8211391: { diameter: 7.7, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211391' },
  RT8211391_1: { diameter: 7.4, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211391_1' },
  RT8211450: { diameter: 9.7, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211450' },
  RT8211450_1: { diameter: 9.4, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211450_1' },
  RT8211501: { diameter: 11.7, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211501' },
  RT8211501_1: { diameter: 11.4, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211501_1' },
  RT8211610: { diameter: 15.6, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211610' },
  RT8211610_1: { diameter: 15.2, toolCode: 8211, maxToolTime: 60, fullName: 'RT-8211610_1' },
  
  RT8221300: { diameter: 5.7, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221300' },
  RT8221391: { diameter: 7.7, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221391' },
  RT8221391_1: { diameter: 7.4, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221391_1' },
  RT8221450: { diameter: 9.7, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221450' },
  RT8221450_1: { diameter: 9.4, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221450_1' },
  RT8221501: { diameter: 11.7, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221501' },
  RT8221501_1: { diameter: 11.4, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221501_1' },
  RT8221610: { diameter: 15.6, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221610' },
  RT8221610_1: { diameter: 15.2, toolCode: 8221, maxToolTime: 60, fullName: 'RT-8221610_1' },
  
  // MXF Tools
  RT15250260: { diameter: 4.7, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250260' },
  RT15250300: { diameter: 5.7, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250300' },
  RT15250391: { diameter: 7.7, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250391' },
  RT15250391_1: { diameter: 7.4, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250391_1' },
  RT15250450: { diameter: 9.7, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250450' },
  RT15250450_1: { diameter: 9.4, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250450_1' },
  RT15250501: { diameter: 11.7, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250501' },
  RT15250501_1: { diameter: 11.4, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250501_1' },
  RT15250610: { diameter: 15.6, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250610' },
  RT15250610_1: { diameter: 15.2, toolCode: 15250, maxToolTime: 60, fullName: 'RT-15250610_1' },
  
  RT15251300: { diameter: 5.7, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251300' },
  RT15251391: { diameter: 7.7, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251391' },
  RT15251391_1: { diameter: 7.4, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251391_1' },
  RT15251450: { diameter: 9.7, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251450' },
  RT15251450_1: { diameter: 9.4, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251450_1' },
  RT15251501: { diameter: 11.7, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251501' },
  RT15251501_1: { diameter: 11.4, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251501_1' },
  RT15251610: { diameter: 15.6, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251610' },
  RT15251610_1: { diameter: 15.2, toolCode: 15251, maxToolTime: 60, fullName: 'RT-15251610_1' },
  
  RT15254300: { diameter: 5.7, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254300' },
  RT15254391: { diameter: 7.7, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254391' },
  RT15254391_1: { diameter: 7.4, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254391_1' },
  RT15254450: { diameter: 9.7, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254450' },
  RT15254450_1: { diameter: 9.4, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254450_1' },
  RT15254501: { diameter: 11.7, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254501' },
  RT15254501_1: { diameter: 11.4, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254501_1' },
  RT15254610: { diameter: 15.6, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254610' },
  RT15254610_1: { diameter: 15.2, toolCode: 15254, maxToolTime: 60, fullName: 'RT-15254610_1' },
  
  RT8521300: { diameter: 5.7, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521300' },
  RT8521391: { diameter: 7.7, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521391' },
  RT8521391_1: { diameter: 7.4, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521391_1' },
  RT8521501: { diameter: 11.7, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521501' },
  RT8521501_1: { diameter: 11.4, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521501_1' },
  RT8521450: { diameter: 9.7, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521450' },
  RT8521450_1: { diameter: 9.4, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521450_1' },
  RT8521610: { diameter: 15.6, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521610' },
  RT8521610_1: { diameter: 15.2, toolCode: 8521, maxToolTime: 60, fullName: 'RT-8521610_1' }
};

/**
 * Find tool identity by diameter and tool code
 * @param {number} diameter - Tool diameter
 * @param {number} toolCode - Tool code
 * @returns {Object|null} - Tool identity object or null if not found
 */
function getToolIdentityFromDiameterAndToolCode(diameter, toolCode) {
  for (const [key, toolIdentity] of Object.entries(ToolIdentity)) {
    if (toolIdentity.diameter === diameter && toolIdentity.toolCode === toolCode) {
      return toolIdentity;
    }
  }
  
  console.log(`There is no tool with D ${diameter} with this toolcode ${toolCode}.`);
  return null;
}

/**
 * Get all tool identities as an array
 * @returns {Array} - Array of tool identity objects
 */
function values() {
  return Object.values(ToolIdentity);
}

module.exports = {
  ...ToolIdentity,
  getToolIdentityFromDiameterAndToolCode,
  values
};