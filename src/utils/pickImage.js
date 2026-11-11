import * as ImagePicker from "expo-image-picker";

// Settings for profile photos: crop to a portrait 4:5 box
const PROFILE_OPTIONS = {
  mediaTypes: ["images"], // photos only, no videos
  allowsEditing: true, // let the user crop it
  aspect: [4, 5], // portrait, like the Discover cards
  quality: 0.6, // smaller file = faster upload
  base64: true, // also give us the photo as text
};

// Settings for chat photos: no cropping, a bit smaller
const CHAT_OPTIONS = {
  mediaTypes: ["images"],
  allowsEditing: false,
  quality: 0.5,
  base64: true,
};

// The photo comes back as text ("data:image/jpeg;base64,...") so we can
// send it to our server inside normal JSON. The <Image> can show it too.
function toPhoto(result) {
  if (result.canceled) return null; // closed without picking
  const photo = result.assets[0];
  if (photo.base64) {
    return (
      "data:" + (photo.mimeType ?? "image/jpeg") + ";base64," + photo.base64
    );
  }
  return photo.uri;
}

// Opens the phone's gallery. forChat = true -> no cropping.
export async function pickImageFromGallery(forChat = false) {
  const result = await ImagePicker.launchImageLibraryAsync(
    forChat ? CHAT_OPTIONS : PROFILE_OPTIONS,
  );
  return toPhoto(result);
}

// Opens the phone's camera app. Asks for permission the first time.
export async function takePhotoWithCamera(forChat = true) {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      "Please allow SoulSync to use your camera in your phone's Settings.",
    );
  }
  const result = await ImagePicker.launchCameraAsync(
    forChat ? CHAT_OPTIONS : PROFILE_OPTIONS,
  );
  return toPhoto(result);
}
