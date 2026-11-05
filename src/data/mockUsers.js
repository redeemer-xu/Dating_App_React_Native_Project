import { teamPhotos } from "./team";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=68";

// Our group mates can log in with these accounts.
export const mockUsers = [
  {
    id: "1",
    username: "redeemer",
    profileId: "redeemer",
    name: "Redeemer",
    email: "redeemer@gmail.com",
    password: "123456",
    avatar: teamPhotos.redeemer,
  },
  {
    id: "2",
    username: "jastin",
    profileId: "jastin",
    name: "Jastin",
    email: "jastin@gmail.com",
    password: "jastin123",
    avatar: teamPhotos.jastin,
  },
  {
    id: "3",
    username: "jennifer",
    profileId: "jennifer",
    name: "Jennifer",
    email: "jennifer@gmail.com",
    password: "jennifer123",
    avatar: teamPhotos.jennifer,
  },
  {
    id: "4",
    username: "shenaiah",
    profileId: "shenaiah",
    name: "Shenaiah",
    email: "shenaiah@gmail.com",
    password: "shenaiah123",
    avatar: teamPhotos.shenaiah,
  },
  {
    id: "5",
    username: "tthrystan",
    profileId: "tthrystan",
    name: "Tthrystan",
    email: "tthrystan@gmail.com",
    password: "tthrystan123",
    avatar: teamPhotos.tthrystan,
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
    profileId: `user-${mockUsers.length + 1}`, // their card in Discover (made after onboarding)
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
