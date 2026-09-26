import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function PromptCard({ question, answer }) {
  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardAlt,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  question: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textOnDark,
  },
});
