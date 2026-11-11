import * as ImagePicker from "expo-image-picker";

// Opens the phone's gallery and returns the picked photo,
// or null if the user closed the gallery without picking.
// The photo comes back as text ("data:image/jpeg;base64,...") so we can
// send it to our server inside normal JSON. The <Image> can show it too.
export async function pickImageFromGallery() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"], // photos only, no videos
    allowsEditing: true, // let the user crop it
    aspect: [4, 5], // portrait, like the Discover cards
    quality: 0.6, // smaller file = faster upload
    base64: true, // also give us the photo as text
  });
  if (result.canceled) return null;
  const photo = result.assets[0];
  if (photo.base64) {
    return "data:" + (photo.mimeType ?? "image/jpeg") + ";base64," + photo.base64;
  }
  return photo.uri;
}
