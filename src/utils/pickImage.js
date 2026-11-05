import * as ImagePicker from "expo-image-picker";

// Opens the phone's gallery and returns the picked photo's uri,
// or null if the user closed the gallery without picking.
export async function pickImageFromGallery() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"], // photos only, no videos
    allowsEditing: true, // let the user crop it
    aspect: [4, 5], // portrait, like the Discover cards
    quality: 0.8,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}
