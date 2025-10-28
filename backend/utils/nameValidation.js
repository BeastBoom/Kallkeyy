/**
 * Validates name fields - only alphabets, spaces, and full stops allowed
 * Examples of valid names: "John Doe", "S.K. Das", "Mary J. Smith"
 */
const validateName = (name) => {
  const errors = [];
  
  // Check if name exists
  if (!name || typeof name !== 'string') {
    return {
      valid: false,
      errors: ['Name is required']
    };
  }
  
  const trimmedName = name.trim();
  
  // Check minimum length
  if (trimmedName.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  // Check maximum length
  if (trimmedName.length > 100) {
    errors.push('Name must not exceed 100 characters');
  }
  
  // Check for valid characters only (letters, spaces, full stops)
  if (!/^[A-Za-z\s.]+$/.test(trimmedName)) {
    errors.push('Name can only contain letters, spaces, and full stops');
  }
  
  // Check for consecutive spaces or dots
  if (/\s{2,}/.test(trimmedName) || /\.{2,}/.test(trimmedName)) {
    errors.push('Name cannot contain consecutive spaces or dots');
  }
  
  // Check if name starts or ends with a dot
  if (trimmedName.startsWith('.') || trimmedName.endsWith('.')) {
    errors.push('Name cannot start or end with a dot');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = { validateName };
