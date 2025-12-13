// Tiny - Shared Utility Functions

// Character classification utilities
export function isDigit(char) {
  return char >= '0' && char <= '9';
}

export function isAlpha(char) {
  return (char >= 'a' && char <= 'z') ||
         (char >= 'A' && char <= 'Z') ||
         char === '_';
}

export function isAlphaNumeric(char) {
  return isAlpha(char) || isDigit(char);
}
