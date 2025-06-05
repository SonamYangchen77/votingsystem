// utils/validators.js

// This function should check if the email is in a valid RUB format
function isValidRubEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@rub.edu.bt$/; // Regex for RUB email format
    return regex.test(email);
  }
  
  module.exports = { isValidRubEmail };
  