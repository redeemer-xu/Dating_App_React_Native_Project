import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import OnboardingHeader from '../../components/OnboardingHeader';
import OnboardingTextField from '../../components/OnboardingTextField';
import SelectableChip from '../../components/SelectableChip';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors } from '../../theme/colors';

const SHOW_ME_OPTIONS = ['Women', 'Men', 'Everyone'];
const LOOKING_FOR_OPTIONS = ['Long-term', 'Casual', 'Not Sure'];

export default function OnboardingStepOne() {
  const { data, update } = useOnboarding();
  const [errors, setErrors] = useState({});

  const formatBirthday = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleContinue = () => {
    const nextErrors = {};

    if (!data.firstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data.birthday.trim())) {
      nextErrors.birthday = 'Enter your birthday in MM/DD/YYYY format.';
    }

    if (data.lookingFor.length === 0) {
      nextErrors.lookingFor = 'Please choose at least one option.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    router.push('/onboarding/step-2');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <OnboardingHeader step={1} showLogo onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Let's start with the basics</Text>

        <OnboardingTextField
          label="First Name"
          value={data.firstName}
          onChangeText={(firstName) => {
            update({ firstName });
            setErrors((prev) => ({ ...prev, firstName: null }));
          }}
          placeholder="Alex"
          error={errors.firstName}
        />

        <OnboardingTextField
          label="Birthday"
          value={data.birthday}
          onChangeText={(birthday) => {
            update({ birthday: formatBirthday(birthday) });
            setErrors((prev) => ({ ...prev, birthday: null }));
          }}
          placeholder="MM/DD/YYYY"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.birthday}
        />

        <Text style={styles.sectionLabel}>Show Me</Text>
        <View style={styles.chipRow}>
          {SHOW_ME_OPTIONS.map((option) => (
            <SelectableChip
              key={option}
              label={option}
              selected={data.showMe === option}
              onPress={() => update({ showMe: option })}
            />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Looking For</Text>
        <View style={styles.chipRow}>
          {LOOKING_FOR_OPTIONS.map((option) => (
            <SelectableChip
              key={option}
              label={option}
              selected={data.lookingFor.includes(option)}
              onPress={() => {
                update({ lookingFor: [option] });
                setErrors((prev) => ({ ...prev, lookingFor: null }));
              }}
            />
          ))}
        </View>
        {errors.lookingFor ? <Text style={styles.errorText}>{errors.lookingFor}</Text> : null}
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
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnDarkSecondary,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
    marginTop: 8,
  },
});
