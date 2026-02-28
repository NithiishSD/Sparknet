import validator from 'validator';

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push('At least one special character');
  return errors;
};

const validateAge = (dateOfBirth, minAge = 5) => {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (age < minAge) return { valid: false, age, message: `Minimum age is ${minAge}` };
  return { valid: true, age };
};

const isMinor = (dateOfBirth) => {
  const { age } = validateAge(dateOfBirth, 0);
  return age < 18;
};

export { validatePassword, validateAge, isMinor };
