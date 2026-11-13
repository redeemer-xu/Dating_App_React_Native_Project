import {
  Camera,
  Map,
  Marker,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import NearbyPersonCard from "../components/NearbyPersonCard";
import { useAuth } from "../context/AuthContext";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { useTheme } from "../context/ThemeContext";
import { USTP_CDO } from "../utils/distance";

// Free map tiles from OpenFreeMap (OpenStreetMap data): no API key, no payment
const LIGHT_MAP = "https://tiles.openfreemap.org/styles/liberty";
const DARK_MAP = "https://tiles.openfreemap.org/styles/dark";

// Map tab (MapLibre, a native map): a pin for every person, placed with their
// latitude/longitude from our server. No paid "place search".
export default function MapScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { currentUser } = useAuth();
  const { profiles, refreshProfiles } = useProfiles();
  const { isHidden } = useMatches();
  const [selected, setSelected] = useState(null); // the pin you tapped
  const [darkFailed, setDarkFailed] = useState(false); // dark map didn't load -> use light
  const pinJustPressed = useRef(false);

  // get the newest locations every time you open the Map tab
  useFocusEffect(
    useCallback(() => {
      refreshProfiles();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // everyone with a location, except me and blocked people
  const people = profiles.filter(
    (p) => p.id !== currentUser?.id && !isHidden(p.id) && p.latitude != null,
  );

  // Start the map so that I AND everyone are visible (a box around all pins).
  // MapLibre wants [longitude, latitude]; the box is [west, south, east, north].
  const me = currentUser?.latitude != null ? currentUser : USTP_CDO;
  const spots = [me, ...people];
  const lngs = spots.map((p) => p.longitude);
  const lats = spots.map((p) => p.latitude);
  const startView =
    people.length > 0
      ? {
          bounds: [
            Math.min(...lngs),
            Math.min(...lats),
            Math.max(...lngs),
            Math.max(...lats),
          ],
          padding: { top: 140, right: 50, bottom: 60, left: 50 }, // space for the title
        }
      : { center: [me.longitude, me.latitude], zoom: 13 };

  const openPerson = (person) => {
    pinJustPressed.current = true;
    setTimeout(() => {
      pinJustPressed.current = false;
    }, 400);
    setSelected(person);
  };

  // tapping the empty map closes the card (but not right after tapping a pin)
  const handleMapPress = () => {
    if (!pinJustPressed.current) setSelected(null);
  };

  return (
    <View style={styles.container}>
      <Map
        key={people.length} // when the people list arrives, start again with everyone in view
        style={StyleSheet.absoluteFill}
        mapStyle={isDark && !darkFailed ? DARK_MAP : LIGHT_MAP}
        logo={false}
        onPress={handleMapPress}
        onDidFailLoadingMap={() => setDarkFailed(true)}
      >
        <Camera initialViewState={startView} />

        {/* blue dot = you (needs location permission) */}
        <UserLocation />

        {people.map((person) => (
          <Marker
            key={person.id}
            id={"person-" + person.id}
            lngLat={[person.longitude, person.latitude]}
            anchor="bottom"
            onPress={() => openPerson(person)}
          >
            {/* the pin: their photo in a pink circle */}
            <View style={styles.pin}>
              <Avatar uri={person.avatar} name={person.name} size={38} />
            </View>
          </Marker>
        ))}
      </Map>

      <SafeAreaView style={styles.top} edges={["top"]} pointerEvents="none">
        <View style={styles.titlePill}>
          <Text style={styles.title}>People near you</Text>
          <Text style={styles.subtitle}>{people.length} on the map</Text>
        </View>
      </SafeAreaView>

      {selected ? (
        <View style={styles.bottom}>
          <NearbyPersonCard
            person={selected}
            onClose={() => setSelected(null)}
          />
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    pin: {
      padding: 3,
      borderRadius: 999,
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: "#FFFFFF",
    },
    top: {
      position: "absolute",
      top: 0,
      left: 16,
      right: 16,
      alignItems: "center",
    },
    titlePill: {
      marginTop: 10,
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 8,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    title: {
      color: colors.textOnDark,
      fontSize: 15,
      fontWeight: "800",
    },
    subtitle: {
      color: colors.textOnDarkSecondary,
      fontSize: 12,
    },
    bottom: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
    },
  });
