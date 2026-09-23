import { Image } from 'expo-image';
import { Plus, X } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function PhotoGridSlot({ uri, onAdd, onRemove }) {
  if (!uri) {
    return (
      <TouchableOpacity style={styles.emptySlot} activeOpacity={0.8} onPress={onAdd}>
        <View style={styles.plusCircle}>
          <Plus size={18} color={colors.accent} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.filledSlot}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <TouchableOpacity style={styles.removeButton} activeOpacity={0.8} onPress={onRemove}>
        <X size={12} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptySlot: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledSlot: {
    flex: 1,
    aspectRatio: 0.78,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15,15,17,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
