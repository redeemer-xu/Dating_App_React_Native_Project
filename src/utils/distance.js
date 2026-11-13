// ---- distance between two people, using their GPS coordinates ----

// Used when someone has no location yet / said "no" to location permission
export const USTP_CDO = { latitude: 8.4859, longitude: 124.6569 };

// Haversine formula: km between two points on Earth
export function kmBetween(a, b) {
  if (a?.latitude == null || b?.latitude == null) return null;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// "2.4 km away" (or the city name if we don't know the location yet)
export function distanceLabel(me, other) {
  const km = kmBetween(me, other);
  if (km === null) return other?.location ?? "";
  if (km < 0.1) return "Very close to you";
  return km.toFixed(1) + " km away"; // e.g. "0.6 km away", "4.9 km away"
}
