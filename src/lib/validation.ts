// Validation rules for authentication forms

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  const pwdRegex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!pwdRegex ) {
    return { isValid: false, error: 'Password must be at least 8 characters one special character one lower and upper case and one number' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
}

// Name validation
export function validateName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Name is too long' };
  }
  
  return { isValid: true };
}

// Phone validation (Rwanda format)
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Rwanda phone format: +250 7XX XXX XXX or 07XX XXX XXX
  const phoneRegex = /^(\+250|0)?7[0-9]{8}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid Rwanda phone number (e.g., +250 788 123 456)' };
  }
  
  return { isValid: true };
}

// Citizen ID validation (Rwanda format)
export function validateCitizenId(citizenId: string): ValidationResult {
  if (!citizenId) {
    return { isValid: false, error: 'Citizen ID is required' };
  }
  
  // Rwanda ID format: 1 XXXX X XXXXXXX X XX (16 digits)
  const idRegex = /^1\s?\d{4}\s?\d{1}\s?\d{7}\s?\d{1}\s?\d{2}$/;
  
  if (!idRegex.test(citizenId)) {
    return { isValid: false, error: 'Please enter a valid Citizen ID (16 digits starting with 1 and with 16 numbers)' };
  }
  
  return { isValid: true };
}

// License number validation (for lawyers)
export function validateLicenseNumber(license: string): ValidationResult {
  if (!license) {
    return { isValid: false, error: 'License number is required' };
  }
  
  if (license.length < 5) {
    return { isValid: false, error: 'License number is too short' };
  }
  
  return { isValid: true };
}

// Employee ID validation (for clerks)
export function validateEmployeeId(empId: string): ValidationResult {
  if (!empId) {
    return { isValid: false, error: 'Employee ID is required' };
  }
  
  if (empId.length < 5) {
    return { isValid: false, error: 'Employee ID is too short' };
  }
  
  return { isValid: true };
}

// Judge ID validation
export function validateJudgeId(judgeId: string): ValidationResult {
  if (!judgeId) {
    return { isValid: false, error: 'Judge ID is required' };
  }
  
  if (judgeId.length < 5) {
    return { isValid: false, error: 'Judge ID is too short' };
  }
  
  return { isValid: true };
}

// Generic text field validation
export function validateTextField(value: string, fieldName: string, minLength: number = 2): ValidationResult {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }
  
  return { isValid: true };
}
