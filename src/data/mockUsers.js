

export const mockUsers = [
  { id: '1', username: 'redeemer', email: 'redeemer@soulsync.com', password: '123456' },
  { id: '2', username: 'maya', email: 'maya@soulsync.com', password: 'maya123' },
  { id: '3', username: 'leo', email: 'leo@soulsync.com', password: 'leo123' },
  { id: '4', username: 'maui', email: 'maui@gmail.com', password: 'maui123' }
];

// Find a user whose email AND password both match
export function findUser(email, password) {
  return mockUsers.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password
  );
}

// Check if an email is already taken
export function emailExists(email) {
  return mockUsers.some(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase()
  );
}

// Add a new user to the list
export function addUser(username, email, password) {
  const newUser = {
    id: String(mockUsers.length + 1),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
  };
  mockUsers.push(newUser);
  return newUser;
}