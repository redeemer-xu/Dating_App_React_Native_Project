import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import OnboardingHeader from '../../components/OnboardingHeader';
import PhotoGridSlot from '../../components/PhotoGridSlot';
import VerificationCard from '../../components/VerificationCard';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors } from '../../theme/colors';

export default function OnboardingStepTwo() {
  const { data, update } = useOnboarding();
  const [errors, setErrors] = useState({});

  const photoCount = data.photos.filter(Boolean).length;

  const handleContinue = () => {
    const nextErrors = {};

    if (photoCount < 2) {
      nextErrors.photos = 'Please add at least 2 photos before continuing.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    router.push('/onboarding/step-3');
  };

  const handleAdd = (index) => {
    const placeholder = `https://picsum.photos/seed/onboarding-${Date.now()}-${index}/400/520`;
    const next = [...data.photos];
    next[index] = placeholder;
    update({ photos: next });
  };

  const handleRemove = (index) => {
    const next = [...data.photos];
    next[index] = null;
    update({ photos: next });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <OnboardingHeader step={2} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Show your best self</Text>
        <Text style={styles.subheading}>Add at least 2 photos to continue.</Text>
        {errors.photos ? <Text style={styles.errorText}>{errors.photos}</Text> : null}

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
        <Button
          title="Continue"
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
    fontWeight: '800',
    color: colors.textOnDark,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: colors.textOnDarkSecondary,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontWeight: '500',
    marginBottom: 12,
  },
});
