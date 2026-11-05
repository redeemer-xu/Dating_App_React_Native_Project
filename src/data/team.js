// Our group mates' photos. They live in the assets/team folder.
// Metro (the bundler) needs the file names written exactly like this.
export const teamPhotos = {
  redeemer: require("../../assets/team/redeemer.jpg"),
  jastin: require("../../assets/team/jastin.jpg"),
  jennifer: require("../../assets/team/barnedo.jpg"),
  shenaiah: require("../../assets/team/sabana.jpg"),
  tthrystan: require("../../assets/team/amomas.jpeg"),
};

// Used by the "+" boxes when a new user adds photos (onboarding step 2)
export const teamPhotoPool = [
  teamPhotos.redeemer,
  teamPhotos.jastin,
  teamPhotos.jennifer,
  teamPhotos.shenaiah,
  teamPhotos.tthrystan,
];
