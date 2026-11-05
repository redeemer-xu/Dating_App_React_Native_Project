// Our team photos are files inside the app (require() gives a number,
// or a small object on web), while other pictures are web links (a string).
// This turns either one into what <Image source={...} /> wants.
export function imageSource(image) {
  if (typeof image === "string" || image == null) return { uri: image };
  return image; // a file inside the app: use it as it is
}
