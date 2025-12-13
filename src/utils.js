// Tiny - Shared Utility Functions

// Character classification utilities
function isDigit(char) {
  return char >= '0' && char <= '9';
}

function isAlpha(char) {
  return (char >= 'a' && char <= 'z') ||
         (char >= 'A' && char <= 'Z') ||
         char === '_';
}

function isAlphaNumeric(char) {
  return isAlpha(char) || isDigit(char);
}

// Export for use in other modules
window.CharUtils = { isDigit, isAlpha, isAlphaNumeric };
