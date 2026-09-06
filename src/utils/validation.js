export function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

export function isValidUsername(username) {
  return username.trim().length >= 3;
}

export function isValidPassword(password) {
  return password.length >= 6;
}