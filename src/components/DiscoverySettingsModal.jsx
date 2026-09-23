import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import PillTabSwitcher from './PillTabSwitcher';
import RangeSlider from './RangeSlider';
import Slider from './Slider';

const SHOW_ME_OPTIONS = ['Women', 'Men', 'Everyone'];

export default function DiscoverySettingsModal({ isVisible, onClose, filters, onApply }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(filters);

  // Re-sync the working copy whenever the sheet is (re)opened.
  useEffect(() => {
    if (isVisible) setDraft(filters);
  }, [isVisible, filters]);

  const handleDone = () => {
    onApply?.(draft);
    onClose?.();
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.grabber} />

          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Discovery Settings</Text>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Maximum Distance</Text>
              <Text style={styles.valueText}>{draft.distance} miles</Text>
            </View>
            <Slider
              min={1}
              max={100}
              step={1}
              value={draft.distance}
              onChange={(distance) => setDraft((prev) => ({ ...prev, distance }))}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Age Range</Text>
              <Text style={styles.valueText}>
                {draft.ageRange[0]} - {draft.ageRange[1]}
              </Text>
            </View>
            <RangeSlider
              min={18}
              max={60}
              value={draft.ageRange}
              onChange={(ageRange) => setDraft((prev) => ({ ...prev, ageRange }))}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Show Me</Text>
            <View style={{ marginTop: 10 }}>
              <PillTabSwitcher
                options={SHOW_ME_OPTIONS}
                activeOption={draft.showMe}
                onChange={(showMe) => setDraft((prev) => ({ ...prev, showMe }))}
              />
            </View>
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.label}>Verified Profiles Only</Text>
              <Text style={styles.helperText}>Only show people who've verified their photos</Text>
            </View>
            <Switch
              value={draft.verifiedOnly}
              onValueChange={(verifiedOnly) => setDraft((prev) => ({ ...prev, verifiedOnly }))}
              trackColor={{ false: colors.cardAlt, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 17, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
  section: {
    marginBottom: 26,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnDark,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  helperText: {
    fontSize: 12,
    color: colors.textOnDarkMuted,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
