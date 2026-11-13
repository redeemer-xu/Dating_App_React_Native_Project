// Fixed lists the app uses. (The users now come from our FastAPI server.)
export const defaultDiscoveryFilters = {
  distance: 50, // km
  ageRange: [18, 40],
  showMe: "Everyone",
  verifiedOnly: false,
};

export const interestOptions = [
  "Art",
  "Travel",
  "Music",
  "Cooking",
  "Movies",
  "Fitness",
  "Books",
  "Gaming",
  "Photography",
  "Outdoors",
  "Pets",
  "Coffee",
  "Tech",
  "Fashion",
  "Volunteering",
  "Writing",
  "Hiking",
  "Learning",
  "Podcasts",
  "Nightlife",
];

export const promptQuestions = [
  "A perfect Sunday looks like",
  "I'll know it's a match when",
  "My most controversial opinion",
  "Together we could",
  "Green flag I look for",
  "Unpopular opinion",
  "The best way to win me over is",
  "One thing I can never live without is",
];
