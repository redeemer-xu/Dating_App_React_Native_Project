import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import OnboardingHeader from '../../components/OnboardingHeader';
import PromptPickerCard from '../../components/PromptPickerCard';
import SelectableChip from '../../components/SelectableChip';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { interestOptions, promptQuestions } from '../../data/mockData';
import { colors } from '../../theme/colors';

const MIN_INTERESTS = 3;

export default function OnboardingStepThree() {
  const { data, update, reset } = useOnboarding();
  const { markOnboardingComplete } = useAuth();
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});

  const filteredInterests = useMemo(() => {
    if (!search.trim()) return interestOptions;
    return interestOptions.filter((option) =>
      option.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search]);

  const toggleInterest = (interest) => {
    const isSelected = data.interests.includes(interest);
    update({
      interests: isSelected
        ? data.interests.filter((item) => item !== interest)
        : [...data.interests, interest],
    });
  };

  const handleComplete = async () => {
    const nextErrors = {};

    if (data.interests.length < MIN_INTERESTS) {
      nextErrors.interests = `Please select at least ${MIN_INTERESTS} interests.`;
    }

    if (!data.promptQuestion) {
      nextErrors.promptQuestion = 'Please choose a conversation prompt.';
    }

    if (!data.promptAnswer.trim()) {
      nextErrors.promptAnswer = 'Please answer the selected prompt before continuing.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    await markOnboardingComplete(data);
    reset();
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <OnboardingHeader step={3} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>What makes you, you?</Text>

        <Text style={styles.sectionLabel}>
          Interests {data.interests.length > 0 && `(${data.interests.length} selected)`}
        </Text>
        {errors.interests ? <Text style={styles.errorText}>{errors.interests}</Text> : null}

        <View style={styles.searchBox}>
          <Search size={16} color={colors.textOnDarkMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search interests"
            placeholderTextColor={colors.textOnDarkMuted}
          />
        </View>

        <View style={styles.chipGrid}>
          {filteredInterests.map((interest) => (
            <SelectableChip
              key={interest}
              label={interest}
              selected={data.interests.includes(interest)}
              onPress={() => toggleInterest(interest)}
            />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 28, marginBottom: 12 }]}>
          Conversation Prompt
        </Text>
        {errors.promptQuestion || errors.promptAnswer ? (
          <Text style={styles.errorText}>
            {errors.promptQuestion || errors.promptAnswer}
          </Text>
        ) : null}
        <PromptPickerCard
          questions={promptQuestions}
          question={data.promptQuestion}
          onChangeQuestion={(promptQuestion) => update({ promptQuestion })}
          answer={data.promptAnswer}
          onChangeAnswer={(promptAnswer) => update({ promptAnswer })}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Complete Profile & Start Syncing"
          variant="accent"
          glow
          onPress={handleComplete}
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
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnDarkSecondary,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.textOnDark,
    fontSize: 15,
  },
  chipGrid: {
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
    marginBottom: 12,
  },
});
