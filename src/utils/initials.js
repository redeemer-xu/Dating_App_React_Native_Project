// For users with no profile picture: show the first letter of their name
// on a colored background. The same name always gets the same color.
const COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#7986CB",
  "#4FC3F7",
  "#4DB6AC",
  "#81C784",
  "#FFB74D",
];

export function getInitial(name) {
  return (name ?? "?").trim().charAt(0).toUpperCase() || "?";
}

export function colorForName(name) {
  const text = name ?? "";
  let total = 0;
  for (let i = 0; i < text.length; i++) total += text.charCodeAt(i);
  return COLORS[total % COLORS.length];
}
