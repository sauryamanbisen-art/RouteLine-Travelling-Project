/**
 * RouteLine - Sign Up Form Logic & Validation (signup.js)
 */

export function validateSignupInput({ name, email, password, confirmPassword }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();
  const cleanConfirm = (confirmPassword || '').trim();

  if (!cleanName || cleanName.length < 2) {
    return { valid: false, error: 'Please enter your full name (minimum 2 characters).' };
  }

  if (!cleanEmail) {
    return { valid: false, error: 'Please enter your email address.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Please provide a valid email format.' };
  }

  if (!cleanPass) {
    return { valid: false, error: 'Please choose a password.' };
  }

  if (cleanPass.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }

  if (!cleanConfirm) {
    return { valid: false, error: 'Please confirm your password.' };
  }

  if (cleanPass !== cleanConfirm) {
    return { valid: false, error: 'Passwords do not match. Please re-enter.' };
  }

  return { valid: true, error: null };
}
