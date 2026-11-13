import * as Location from "expo-location";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../context/ProfilesContext";
import { kmBetween, USTP_CDO } from "./distance";

// Once after logging in: ask for location permission, read the phone's GPS,
// and save it on the server (so others see how far away you are).
// Said "no"? Then we use USTP-CDO, but only if you have no location yet.
export function useMyLocation() {
  const { currentUser } = useAuth();
  const { saveProfile } = useProfiles();
  const myId = currentUser?.id;

  useEffect(() => {
    if (!myId) return;
    let cancelled = false;

    const updateLocation = async () => {
      let spot = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          // rounded to about 100 m, so your exact house is not shared
          spot = {
            latitude: Number(position.coords.latitude.toFixed(3)),
            longitude: Number(position.coords.longitude.toFixed(3)),
          };
        }
      } catch {
        // GPS off or not available -> handled below
      }
      if (cancelled) return;

      const hasLocation = currentUser.latitude != null;
      if (!spot) {
        if (hasLocation) return; // keep the old location
        spot = USTP_CDO;
      }
      // only save when it changed by more than 100 m
      const moved = kmBetween(currentUser, spot);
      if (hasLocation && moved !== null && moved < 0.1) return;
      saveProfile(myId, spot).catch(() => {});
    };

    updateLocation();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);
}
