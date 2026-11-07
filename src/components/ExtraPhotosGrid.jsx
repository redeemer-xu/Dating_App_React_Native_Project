import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { pickImageFromGallery } from "../utils/pickImage";
import PhotoGridSlot from "./PhotoGridSlot";

export const MAX_EXTRA_PHOTOS = 5;

// Up to 5 extra photos (besides the profile picture).
// photos = list of photo uris, onChange = gets the new list.
export default function ExtraPhotosGrid({ photos, onChange, onError }) {
  // filled boxes first, then empty "+" boxes until there are 5
  const slots = [
    ...photos,
    ...Array(MAX_EXTRA_PHOTOS - photos.length).fill(null),
  ];

  const handleAdd = async () => {
    try {
      const uri = await pickImageFromGallery();
      if (uri) onChange([...photos, uri].slice(0, MAX_EXTRA_PHOTOS));
    } catch {
      onError?.("Could not open the gallery. Please try again.");
    }
  };

  const handleRemove = (index) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <View>
      <Text style={styles.label}>
        More photos ({photos.length}/{MAX_EXTRA_PHOTOS}) · optional
      </Text>
      <View style={styles.grid}>
        {slots.map((uri, index) => (
          <View key={index} style={styles.cell}>
            <PhotoGridSlot
              uri={uri}
              onAdd={handleAdd}
              onRemove={() => handleRemove(index)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cell: {
    width: "30%", // 3 boxes per row
    flexDirection: "row",
  },
});
