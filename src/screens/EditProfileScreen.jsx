import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import GradientBackground from "../components/GradientBackground";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";

const MAX_BIO_LENGTH = 150;

export default function EditProfileScreen() {
  const { currentUser, updateProfile } = useAuth();

  // Start the inputs with the user's current info
  const [name, setName] = useState(
    currentUser?.name ?? currentUser?.username ?? "",
  );
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const newErrors = {};

    if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (bio.length > MAX_BIO_LENGTH) {
      newErrors.bio = `Bio must be ${MAX_BIO_LENGTH} characters or less.`;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    updateProfile({ name: name.trim(), bio: bio.trim() });
    router.back();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <ArrowLeft size={22} color={colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.iconButton} />
        </View>

        <FormInput
          label="Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          error={errors.name}
        />

        <FormInput
          label={`Bio (${bio.length}/${MAX_BIO_LENGTH})`}
          placeholder="Tell people about yourself"
          value={bio}
          onChangeText={setBio}
          error={errors.bio}
        />

        <View style={styles.actions}>
          <Button title="Save" variant="accent" onPress={handleSave} />
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.textOnDark,
    fontSize: 18,
    fontWeight: "700",
  },
  actions: {
    gap: 12,
    marginTop: 10,
  },
});
