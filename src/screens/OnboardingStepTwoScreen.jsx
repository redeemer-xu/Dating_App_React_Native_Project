import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../components/Button";
import OnboardingHeader from "../components/OnboardingHeader";
import PhotoGridSlot from "../components/PhotoGridSlot";
import VerificationCard from "../components/VerificationCard";
import { useOnboarding } from "../context/OnboardingContext";
import { teamPhotoPool } from "../data/team";
import { colors } from "../theme/colors";

export default function OnboardingStepTwo() {
  const { data, update } = useOnboarding();
  const [errors, setErrors] = useState({});
  const [nextPhoto, setNextPhoto] = useState(0); // which team photo comes next

  const photoCount = data.photos.filter(Boolean).length;

  const handleContinue = () => {
    const nextErrors = {};

    if (photoCount < 2) {
      nextErrors.photos = "Please add at least 2 photos before continuing.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    router.push("/onboarding/step-3");
  };

  const handleAdd = (index) => {
    // Mock "gallery": each tap adds the next team photo that is not in the grid yet.
    // (Remove a photo with the X and tap + again to get a different one.)
    let pickIndex = nextPhoto % teamPhotoPool.length;
    for (let i = 0; i < teamPhotoPool.length; i++) {
      const candidate = (nextPhoto + i) % teamPhotoPool.length;
      if (!data.photos.includes(teamPhotoPool[candidate])) {
        pickIndex = candidate;
        break;
      }
    }
    const next = [...data.photos];
    next[index] = teamPhotoPool[pickIndex];
    update({ photos: next });
    setNextPhoto(pickIndex + 1);
  };

  const handleRemove = (index) => {
    const next = [...data.photos];
    next[index] = null;
    update({ photos: next });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <OnboardingHeader step={2} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Show your best self</Text>
        <Text style={styles.subheading}>
          Add at least 2 photos to continue.
        </Text>
        {errors.photos ? (
          <Text style={styles.errorText}>{errors.photos}</Text>
        ) : null}

        <View style={styles.grid}>
          {data.photos.map((uri, index) => (
            <PhotoGridSlot
              key={index}
              uri={uri}
              onAdd={() => handleAdd(index)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </View>

        <VerificationCard onPress={() => {}} />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" variant="accent" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textOnDark,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: colors.textOnDarkSecondary,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 12,
  },
});
