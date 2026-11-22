import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

// ------------------------------------------------------------------
// WHERE IS OUR FASTAPI SERVER?
// 1. A server address saved in the app (Welcome screen -> "Server" or
//    Settings -> Server address).
// 2. MANUAL_API_URL below, if you write one, e.g. "http://192.168.43.120:8000"
// 3. While developing ("npx expo start"): the laptop running Expo (automatic)
// 4. The final APK: our server online on Render (works anywhere with internet)

// Our server online. After deploying on Render, paste YOUR address here
// (Render dashboard -> soulsync-api -> the link at the top).
export const ONLINE_API_URL = "https://soulsync-api-r4ws.onrender.com";

const MANUAL_API_URL = null;
const SERVER_KEY = "soulsync-server"; // where the saved address lives (AsyncStorage)
// ------------------------------------------------------------------

// Find the server automatically (no saved address)
function autoServer() {
  if (MANUAL_API_URL) return MANUAL_API_URL;
  // hostUri looks like "192.168.43.120:8081" = the laptop running Expo
  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (expoHost) return "http://" + expoHost + ":8000";
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return "http://localhost:8000";
  }
  return ONLINE_API_URL; // the APK: no laptop needed
}

// https = our server online on Render. The free server can take up to
// 1 minute to wake up if nobody used it for a while, so we wait longer.
export function isOnlineServer(url) {
  return typeof url === "string" && url.startsWith("https://");
}

let apiUrl = autoServer();
let savedServer = null; // the address the user typed in the app (or null)

// The server address the app is using right now
export function getApiUrl() {
  return apiUrl;
}

// true when the user typed an address in the app
export function hasSavedServer() {
  return savedServer !== null;
}

// "192.168.43.5" -> "http://192.168.43.5:8000"
export function normalizeServer(text) {
  let url = text.trim().replace(/\/+$/, "");
  if (!url) return null;
  if (!/^https?:\/\//.test(url)) url = "http://" + url;
  const host = url.replace(/^https?:\/\//, "");
  // plain http without a port = our uvicorn on 8000 (https online servers keep theirs)
  if (url.startsWith("http://") && !/:\d+$/.test(host)) url += ":8000";
  return url;
}

// Called once when the app opens (before checking the saved login)
export async function loadSavedServer() {
  try {
    const saved = await AsyncStorage.getItem(SERVER_KEY);
    if (saved) {
      savedServer = saved;
      apiUrl = saved;
    }
  } catch {
    // nothing saved -> keep the automatic address
  }
  return apiUrl;
}

// GET / on that address: is our SoulSync server really there?
export async function testServer(url) {
  try {
    const response = await withTimeout(
      fetch(url + "/"),
      isOnlineServer(url) ? 70000 : 6000,
    );
    const data = await response.json();
    return (
      typeof data?.message === "string" && data.message.includes("SoulSync")
    );
  } catch {
    return false;
  }
}

// Save a new server address (stays after closing the app)
export async function saveServer(url) {
  savedServer = url;
  apiUrl = url;
  try {
    await AsyncStorage.setItem(SERVER_KEY, url);
  } catch {
    // could not save; it still works until the app closes
  }
}

// Forget the typed address and find the server automatically again
export async function resetServer() {
  savedServer = null;
  apiUrl = autoServer();
  try {
    await AsyncStorage.removeItem(SERVER_KEY);
  } catch {
    // nothing to remove
  }
}

// Stop waiting after some seconds (so "Logging in..." never hangs forever)
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

// ---- photos: the server saves "/photos/abc.jpg", the app needs the full link
export function fullUrl(path) {
  if (typeof path === "string" && path.startsWith("/")) return apiUrl + path;
  return path;
}

// ...and before sending a photo back, turn the full link into "/photos/abc.jpg" again
function serverPath(url) {
  if (typeof url === "string" && url.startsWith(apiUrl)) {
    return url.slice(apiUrl.length);
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
    verificationPhoto: fullUrl(user.verificationPhoto),
  };
}

// A chat message from the server: fix its photo link too
function fixMessage(message) {
  return { ...message, image: fullUrl(message.image) };
}

// ---- the one function that talks to the server: fetch -> check -> json
async function request(path, { method = "GET", body, timeout } = {}) {
  const online = isOnlineServer(apiUrl);
  let response;
  try {
    response = await withTimeout(
      fetch(apiUrl + path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }),
      timeout ?? (online ? 70000 : 15000), // online: room for waking up
    );
  } catch {
    if (online) {
      throw new Error(
        "Can't reach the SoulSync server. Check your internet, then try again.",
      );
    }
    // no answer = the laptop server is off, the address is wrong, or another WiFi
    throw new Error(
      "Can't reach the server at " +
        apiUrl +
        ". Is it running, and are you on the same WiFi/hotspot? You can change the server on the Welcome screen.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail ?? "Request failed (" + response.status + ")");
  }
  return data;
}

// ---- photo upload
// Expo's fetch can't send a phone file with FormData ({ uri, name, type }),
// so we send the photo as base64 text inside normal JSON instead.
async function uploadPhoto(uri) {
  let data = uri;
  if (!uri.startsWith("data:")) {
    // web: turn a blob:/file link into "data:image/...;base64,..."
    const blob = await (await fetch(uri)).blob();
    data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () =>
        reject(new Error("Could not read the photo. Please pick it again."));
      reader.readAsDataURL(blob);
    });
  }
  const result = await request("/upload-base64", {
    method: "POST",
    body: { data },
    timeout: 90000, // photos are big: wait up to 1.5 minutes
  });
  return result.url; // "/photos/abc.jpg"
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

// POST /users/:id/password = change password (Settings)
export function apiChangePassword(id, currentPassword, newPassword) {
  return request("/users/" + id + "/password", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

// ================================================================ USERS (CRUD)
// GET /users = everyone who finished onboarding
export async function apiGetUsers() {
  return (await request("/users")).map(fixUser);
}

// GET /users/:id
export async function apiGetUser(id) {
  return fixUser(await request("/users/" + id));
}

// PATCH /users/:id = change only the fields we send.
// New photos are uploaded first, then their links are saved.
export async function apiUpdateUser(id, changes) {
  const body = { ...changes };
  // interests use PUT (replace the whole list), everything else uses PATCH
  if ("tags" in body) {
    await apiReplaceInterests(id, body.tags);
    delete body.tags;
  }
  if ("avatar" in body) body.avatar = await preparePhoto(body.avatar);
  if ("verificationPhoto" in body) {
    body.verificationPhoto = await preparePhoto(body.verificationPhoto);
  }
  if ("photos" in body) {
    body.photos = await Promise.all((body.photos ?? []).map(preparePhoto));
  }
  delete body.images; // the server builds images from avatar + photos
  return fixUser(await request("/users/" + id, { method: "PATCH", body }));
}

// PUT /users/:id/interests = REPLACE the whole interests list
export async function apiReplaceInterests(id, tags) {
  return fixUser(
    await request("/users/" + id + "/interests", {
      method: "PUT",
      body: { tags },
    }),
  );
}

// ================================================================ LIKES & BLOCKS
// GET /users/:id/likes -> { liked: [...], likedBy: [...] }
export function apiGetLikes(id) {
  return request("/users/" + id + "/likes");
}

// POST /likes
export function apiLike(fromId, toId) {
  return request("/likes", {
    method: "POST",
    body: { from_id: Number(fromId), to_id: Number(toId) },
  });
}

// POST /likes/seen = I saw these "X liked you" notifications
export function apiMarkLikesSeen(myId, fromIds) {
  return request("/likes/seen", {
    method: "POST",
    body: { user_id: Number(myId), from_ids: fromIds.map(Number) },
  });
}

// DELETE /likes/:from/:to
export function apiUnlike(fromId, toId) {
  return request("/likes/" + fromId + "/" + toId, { method: "DELETE" });
}

// GET /users/:id/blocks -> { hidden: [...] }
export function apiGetBlocks(id) {
  return request("/users/" + id + "/blocks");
}

// POST /blocks
export function apiBlock(fromId, toId) {
  return request("/blocks", {
    method: "POST",
    body: { from_id: Number(fromId), to_id: Number(toId) },
  });
}

// GET /users/:id/blocked -> { blocked: [...] } (only people I blocked)
export function apiGetBlocked(id) {
  return request("/users/" + id + "/blocked");
}

// DELETE /blocks/:from/:to = unblock
export function apiUnblock(fromId, toId) {
  return request("/blocks/" + fromId + "/" + toId, { method: "DELETE" });
}

// ================================================================ MESSAGES
// GET /messages?user_a=..&user_b=.. = one conversation
export async function apiGetMessages(myId, otherId) {
  const messages = await request(
    "/messages?user_a=" + myId + "&user_b=" + otherId,
  );
  return messages.map(fixMessage);
}

// POST /messages (text, a photo, or both). The photo is uploaded first.
export async function apiSendMessage(myId, otherId, text, photo) {
  const image = photo ? await preparePhoto(photo) : null;
  const message = await request("/messages", {
    method: "POST",
    body: {
      sender_id: Number(myId),
      receiver_id: Number(otherId),
      text,
      image,
    },
  });
  return fixMessage(message);
}

// POST /messages/read = I opened the chat, their messages are now "seen"
export function apiMarkRead(myId, otherId) {
  return request("/messages/read", {
    method: "POST",
    body: { reader_id: Number(myId), other_id: Number(otherId) },
  });
}

// POST /users/:id/delete-account = delete my account (needs my password)
export function apiDeleteAccount(id, password) {
  return request("/users/" + id + "/delete-account", {
    method: "POST",
    body: { password },
  });
}

// POST /messages/:id/reactions = react (love, like, haha, wow, sad, angry)
export async function apiReact(messageId, myId, reaction) {
  const message = await request("/messages/" + messageId + "/reactions", {
    method: "POST",
    body: { user_id: Number(myId), reaction },
  });
  return fixMessage(message);
}

// DELETE /messages/:id/reactions/:userId = remove my reaction
export async function apiRemoveReaction(messageId, myId) {
  const message = await request(
    "/messages/" + messageId + "/reactions/" + myId,
    {
      method: "DELETE",
    },
  );
  return fixMessage(message);
}

// DELETE /messages/:id
export function apiDeleteMessage(messageId) {
  return request("/messages/" + messageId, { method: "DELETE" });
}

// DELETE /users/:me/chats/:otherId = delete the whole chat (only for me)
export function apiDeleteChat(myId, otherId) {
  return request("/users/" + myId + "/chats/" + otherId, { method: "DELETE" });
}

// GET /users/:id/inbox = my conversations, newest first
export async function apiGetInbox(id) {
  const inbox = await request("/users/" + id + "/inbox");
  return inbox.map((item) => ({
    ...item,
    lastMessage: fixMessage(item.lastMessage),
  }));
}
