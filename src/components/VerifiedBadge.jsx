import { BadgeCheck } from "lucide-react-native";

// Blue check shown next to the name of people who verified with a selfie
export default function VerifiedBadge({ size = 20 }) {
  return <BadgeCheck size={size} color="#FFFFFF" fill="#1D9BF0" strokeWidth={2.2} />;
}
