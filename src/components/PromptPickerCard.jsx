import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function PromptPickerCard({
  questions,
  question,
  onChangeQuestion,
  answer,
  onChangeAnswer,
}) {
  const [isPickerVisible, setPickerVisible] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Prompt</Text>
      <TouchableOpacity
        style={styles.dropdown}
        activeOpacity={0.8}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={[styles.dropdownText, !question && styles.dropdownPlaceholder]}>
          {question || 'Choose a question'}
        </Text>
        <ChevronDown size={18} color={colors.textOnDarkMuted} />
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 16 }]}>Your Answer</Text>
      <TextInput
        style={styles.answerInput}
        value={answer}
        onChangeText={onChangeAnswer}
        placeholder="Type your answer..."
        placeholderTextColor={colors.textOnDarkMuted}
        multiline
      />

      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <FlatList
              data={questions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = item === question;
                return (
                  <TouchableOpacity
                    style={styles.optionRow}
                    activeOpacity={0.8}
                    onPress={() => {
                      onChangeQuestion(item);
                      setPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={18} color={colors.accent} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardAlt,
    borderRadius: 18,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  dropdownText: {
    fontSize: 15,
    color: colors.textOnDark,
    flexShrink: 1,
  },
  dropdownPlaceholder: {
    color: colors.textOnDarkMuted,
  },
  answerInput: {
    minHeight: 80,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    color: colors.textOnDark,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,15,17,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  optionText: {
    fontSize: 15,
    color: colors.textOnDarkSecondary,
    flexShrink: 1,
    paddingRight: 12,
  },
  optionTextSelected: {
    color: colors.textOnDark,
    fontWeight: '700',
  },
});
