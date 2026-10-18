const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=68";

export const mockUsers = [
  {
    id: "1",
    username: "redeemer",
    name: "Redeemer",
    email: "redeemer@gmail.com",
    password: "123456",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: "2",
    username: "maya",
    name: "Maya",
    email: "maya@gmail.com",
    password: "maya123",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "3",
    username: "leo",
    name: "Leonardo",
    email: "leo@gmail.com",
    password: "leo123",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "4",
    username: "maui",
    name: "Alexander",
    email: "maui@gmail.com",
    password: "maui123",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

// Find a user whose email AND password both match
export function findUser(email, password) {
  return mockUsers.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password,
  );
}

// Check if an email is already taken
export function emailExists(email) {
  return mockUsers.some(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

// Add a new user to the list
export function addUser(username, email, password) {
  const newUser = {
    id: String(mockUsers.length + 1),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
    avatar: DEFAULT_AVATAR,
  };
  mockUsers.push(newUser);
  return newUser;
}

// update an existing user's info
export function updateUser(id, changes) {
  const user = mockUsers.find((u) => u.id === id);
  if (user) Object.assign(user, changes);
  return user;
}
