import Constants from "expo-constants";
import { Platform } from "react-native";

// ------------------------------------------------------------------
// WHERE IS OUR FASTAPI SERVER?
// Normally you don't need to touch this: the app uses the same laptop
// that runs "npx expo start". If it can't connect, put your laptop's IP
// here, e.g. "http://192.168.43.120:8000" (keep the quotes).
const MANUAL_API_URL = null;
// ------------------------------------------------------------------

function findServer() {
  if (MANUAL_API_URL) return MANUAL_API_URL;
  // hostUri looks like "192.168.43.120:8081" = the laptop running Expo
  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (expoHost) return `http://${expoHost}:8000`;
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://10.0.2.2:8000"; // Android emulator -> the laptop
}

export const API_URL = findServer();

// ---- photos: the server saves "/uploads/abc.jpg", the app needs the full link
export function fullUrl(path) {
  if (typeof path === "string" && path.startsWith("/")) return API_URL + path;
  return path;
}

// ...and before sending a photo back, turn the full link into "/uploads/abc.jpg" again
function serverPath(url) {
  if (typeof url === "string" && url.startsWith(API_URL)) {
    return url.slice(API_URL.length);
  }
  return url;
}

// Fix every photo link in a user that came from the server
function fixUser(user) {
  return {
    ...user,
    profileId: user.id,
    avatar: fullUrl(user.avatar),
    photos: (user.photos ?? []).map(fullUrl),
    images: (user.images ?? []).map(fullUrl),
  };
}

// ---- the one function that talks to the server: fetch -> check -> json
async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // no answer at all = the server is off, or the phone is on another WiFi
    throw new Error(
      `Can't reach the server at ${API_URL}. Is it running, and are you on the same WiFi/hotspot?`,
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail ?? `Request failed (${response.status})`);
  }
  return data;
}

// ---- photo upload (POST with a file instead of JSON)
async function uploadPhoto(uri) {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    form.append("file", blob, "photo.jpg");
  } else {
    form.append("file", { uri, name: "photo.jpg", type: "image/jpeg" });
  }
  let response;
  try {
    response = await fetch(API_URL + "/upload", { method: "POST", body: form });
  } catch {
    throw new Error(
      `Can't reach the server at ${API_URL} to upload the photo.`,
    );
  }
  if (!response.ok) throw new Error(`Photo upload failed (${response.status})`);
  const data = await response.json();
  return data.url; // "/uploads/abc.jpg"
}

// A photo that is only on this phone (file://, blob:) gets uploaded first.
// A photo already on the server stays the same.
async function preparePhoto(uri) {
  if (!uri) return null;
  const path = serverPath(uri);
  if (path.startsWith("/")) return path;
  return uploadPhoto(uri);
}

// ================================================================ ACCOUNTS
// POST /login
export async function apiLogin(email, password) {
  return fixUser(
    await request("/login", { method: "POST", body: { email, password } }),
  );
}

// POST /register
export async function apiRegister(username, email, password) {
  return fixUser(
    await request("/register", {
      method: "POST",
      body: { username, email, password },
    }),
  );
}

// ================================================================ USERS (CRUD)
// GET /users = everyone who finished onboarding
export async function apiGetUsers() {
  return (await request("/users")).map(fixUser);
}

// GET /users/:id
export async function apiGetUser(id) {
  return fixUser(await request(`/users/${id}`));
}

// PATCH /users/:id = change only the fields we send.
// New photos are uploaded first, then their links are saved.
export async function apiUpdateUser(id, changes) {
  const body = { ...changes };
  if ("avatar" in body) body.avatar = await preparePhoto(body.avatar);
  if ("photos" in body) {
    body.photos = await Promise.all((body.photos ?? []).map(preparePhoto));
  }
  delete body.images; // the server builds images from avatar + photos
  return fixUser(await request(`/users/${id}`, { method: "PATCH", body }));
}

// DELETE /users/:id = delete account
export async function apiDeleteUser(id) {
  return request(`/users/${id}`, { method: "DELETE" });
}

// ================================================================ LIKES & BLOCKS
// GET /users/:id/likes -> { liked: [...], likedBy: [...] }
export function apiGetLikes(id) {
  return request(`/users/${id}/likes`);
}

// POST /likes
export function apiLike(fromId, toId) {
  return request("/likes", {
    method: "POST",
    body: { from_id: Number(fromId), to_id: Number(toId) },
  });
}

// DELETE /likes/:from/:to
export function apiUnlike(fromId, toId) {
  return request(`/likes/${fromId}/${toId}`, { method: "DELETE" });
}

// GET /users/:id/blocks -> { hidden: [...] }
export function apiGetBlocks(id) {
  return request(`/users/${id}/blocks`);
}

// POST /blocks
export function apiBlock(fromId, toId) {
  return request("/blocks", {
    method: "POST",
    body: { from_id: Number(fromId), to_id: Number(toId) },
  });
}

// ================================================================ MESSAGES
// GET /messages?user_a=..&user_b=.. = one conversation
export function apiGetMessages(myId, otherId) {
  return request(`/messages?user_a=${myId}&user_b=${otherId}`);
}

// POST /messages
export function apiSendMessage(myId, otherId, text) {
  return request("/messages", {
    method: "POST",
    body: { sender_id: Number(myId), receiver_id: Number(otherId), text },
  });
}

// DELETE /messages/:id
export function apiDeleteMessage(messageId) {
  return request(`/messages/${messageId}`, { method: "DELETE" });
}

// GET /users/:id/inbox = my conversations, newest first
export function apiGetInbox(id) {
  return request(`/users/${id}/inbox`);
}
