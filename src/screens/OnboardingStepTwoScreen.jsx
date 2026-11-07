import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../components/Button";
import ExtraPhotosGrid from "../components/ExtraPhotosGrid";
import OnboardingHeader from "../components/OnboardingHeader";
import PhotoGridSlot from "../components/PhotoGridSlot";
import VerificationCard from "../components/VerificationCard";
import { useOnboarding } from "../context/OnboardingContext";
import { colors } from "../theme/colors";
import { pickImageFromGallery } from "../utils/pickImage";

export default function OnboardingStepTwo() {
  const { data, update } = useOnboarding();
  const [errors, setErrors] = useState({});

  // The photo is optional. No photo = the first letter of your name is shown.
  const handleContinue = () => {
    setErrors({});
    router.push("/onboarding/step-3");
  };

  // Opens the phone's gallery. The picked photo becomes the profile picture.
  const handlePick = async () => {
    try {
      const uri = await pickImageFromGallery();
      if (!uri) return; // closed the gallery without picking
      update({ photo: uri });
      setErrors({});
    } catch {
      setErrors({ photo: "Could not open the gallery. Please try again." });
    }
  };

  const handleRemove = () => update({ photo: null });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <OnboardingHeader step={2} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Show your best self</Text>
        <Text style={styles.subheading}>
          Upload a profile picture and up to 5 more photos. It&apos;s all
          optional: skip it and we&apos;ll show the first letter of your name.
        </Text>
        {errors.photo ? (
          <Text style={styles.errorText}>{errors.photo}</Text>
        ) : null}

        <View style={styles.photoBox}>
          <PhotoGridSlot
            uri={data.photo}
            onAdd={handlePick}
            onRemove={handleRemove}
          />
        </View>

        <View style={styles.pickButton}>
          <Button
            title={
              data.photo ? "Change Profile Picture" : "Choose Profile Picture"
            }
            variant="secondary"
            onPress={handlePick}
          />
        </View>

        <View style={styles.morePhotos}>
          <ExtraPhotosGrid
            photos={data.extraPhotos}
            onChange={(extraPhotos) => update({ extraPhotos })}
            onError={(message) => setErrors({ photo: message })}
          />
        </View>

        <VerificationCard onPress={() => {}} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            data.photo || data.extraPhotos.length > 0
              ? "Continue"
              : "Skip for now"
          }
          variant="accent"
          onPress={handleContinue}
        />
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
  photoBox: {
    width: 200,
    alignSelf: "center",
    flexDirection: "row", // lets the photo box use its normal size
    marginBottom: 16,
  },
  pickButton: {
    marginBottom: 24,
  },
  morePhotos: {
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
