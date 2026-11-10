import { router } from "expo-router";
import { ArrowLeft, Camera } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import ExtraPhotosGrid from "../components/ExtraPhotosGrid";
import FormInput from "../components/FormInput";
import GradientBackground from "../components/GradientBackground";
import PromptPickerCard from "../components/PromptPickerCard";
import SelectableChip from "../components/SelectableChip";
import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../context/ProfilesContext";
import { interestOptions, promptQuestions } from "../data/mockData";
import { colors } from "../theme/colors";
import { pickImageFromGallery } from "../utils/pickImage";

const MAX_BIO_LENGTH = 150;

export default function EditProfileScreen() {
  const { currentUser } = useAuth();
  const { saveProfile } = useProfiles();

  // Start the inputs with my current profile (from the server)
  const [photo, setPhoto] = useState(currentUser?.avatar ?? null);
  const [extraPhotos, setExtraPhotos] = useState(currentUser?.photos ?? []); // up to 5
  const [name, setName] = useState(
    currentUser?.name ?? currentUser?.username ?? "",
  );
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [interests, setInterests] = useState(currentUser?.tags ?? []);
  const [promptQuestion, setPromptQuestion] = useState(
    currentUser?.prompts?.[0]?.question ?? "",
  );
  const [promptAnswer, setPromptAnswer] = useState(
    currentUser?.prompts?.[0]?.answer ?? "",
  );
  const [saving, setSaving] = useState(false); // uploading photos + saving
  const [errors, setErrors] = useState({});

  // Pick a new profile picture from the gallery
  const handleChangePhoto = async () => {
    try {
      const uri = await pickImageFromGallery();
      if (uri) setPhoto(uri);
    } catch {
      setErrors((prev) => ({ ...prev, photo: "Could not open the gallery." }));
    }
  };

  // Tap once = add it, tap again = remove it
  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest],
    );
  };

  const handleSave = async () => {
    const newErrors = {};

    if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (bio.length > MAX_BIO_LENGTH) {
      newErrors.bio = `Bio must be ${MAX_BIO_LENGTH} characters or less.`;
    }

    if (promptQuestion && !promptAnswer.trim()) {
      newErrors.prompt = "Write an answer for your prompt.";
    }

    if (!promptQuestion && promptAnswer.trim()) {
      newErrors.prompt = "Choose a question for your answer.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // PATCH /users/:id -> new photos are uploaded first, then everything is saved
    setSaving(true);
    try {
      await saveProfile(currentUser.id, {
        name: name.trim(),
        bio: bio.trim(),
        tags: interests,
        prompts: promptQuestion
          ? [{ question: promptQuestion, answer: promptAnswer.trim() }]
          : [],
        avatar: photo,
        photos: extraPhotos,
      });
      router.back();
    } catch (err) {
      setErrors({ save: err.message });
    } finally {
      setSaving(false);
    }
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.photoRow}>
            {/* tap the photo to change it */}
            <TouchableOpacity activeOpacity={0.8} onPress={handleChangePhoto}>
              <Avatar uri={photo} name={name} size={100} />
              <View style={styles.cameraBadge}>
                <Camera size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            {photo ? (
              <TouchableOpacity onPress={() => setPhoto(null)} hitSlop={10}>
                <Text style={styles.removeText}>Remove photo</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.hintText}>Tap to add a profile picture</Text>
            )}
          </View>
          {errors.photo ? (
            <Text style={styles.errorText}>{errors.photo}</Text>
          ) : null}

          <View style={styles.morePhotos}>
            <ExtraPhotosGrid
              photos={extraPhotos}
              onChange={setExtraPhotos}
              onError={(message) =>
                setErrors((prev) => ({ ...prev, photo: message }))
              }
            />
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

          <Text style={styles.sectionTitle}>
            Interests {interests.length > 0 && `(${interests.length} selected)`}
          </Text>
          <View style={styles.chipGrid}>
            {interestOptions.map((interest) => (
              <SelectableChip
                key={interest}
                label={interest}
                selected={interests.includes(interest)}
                onPress={() => toggleInterest(interest)}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Prompt</Text>
          <PromptPickerCard
            questions={promptQuestions}
            question={promptQuestion}
            onChangeQuestion={setPromptQuestion}
            answer={promptAnswer}
            onChangeAnswer={setPromptAnswer}
          />
          {errors.prompt ? (
            <Text style={styles.errorText}>{errors.prompt}</Text>
          ) : null}

          <View style={styles.actions}>
            {errors.save ? (
              <Text style={styles.errorText}>{errors.save}</Text>
            ) : null}
            <Button
              title={saving ? "Saving..." : "Save"}
              variant="accent"
              onPress={handleSave}
              disabled={saving}
            />
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  morePhotos: {
    marginBottom: 20,
  },
  photoRow: {
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
  hintText: {
    color: colors.textOnDarkMuted,
    fontSize: 13,
  },
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
  scrollContent: {
    paddingBottom: 32,
  },
  sectionTitle: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  errorText: {
    color: colors.accent,
    fontSize: 13,
    marginTop: 8,
  },
  actions: {
    gap: 12,
    marginTop: 24,
  },
});
