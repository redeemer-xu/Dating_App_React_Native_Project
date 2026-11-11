import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { imageSource } from '../utils/imageSource';
import { colorForName, getInitial } from '../utils/initials';


// uri = the photo. If there is no photo, the first letter of "name" is shown.
export default function Avatar({ uri, name, size = 48, ringed = false, online = false }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const dimension = ringed ? size + 6 : size;
  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.wrapper, { width: dimension, height: dimension }]}>
      {ringed && (
        <View
          style={[
            styles.ring,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        />
      )}
      {uri ? (
        <Image
          source={imageSource(uri)}
          style={[styles.image, circle]}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={[styles.initialCircle, circle, { backgroundColor: colorForName(name) }]}>
          <Text style={[styles.initialText, { fontSize: size * 0.42 }]}>
            {getInitial(name)}
          </Text>
        </View>
      )}
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.26,
              height: size * 0.26,
              borderRadius: (size * 0.26) / 2,
              right: ringed ? 2 : 0,
              bottom: ringed ? 2 : 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  image: {
    backgroundColor: colors.cardAlt,
  },
  initialCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
