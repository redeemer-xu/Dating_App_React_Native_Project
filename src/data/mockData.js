import { teamPhotos } from "./team";

export const defaultDiscoveryFilters = {
  distance: 25,
  ageRange: [22, 32],
  showMe: "Everyone",
  verifiedOnly: false,
};

// Our group mates are the mock users.
// Edit age, title, bio, tags and prompts here whenever you want.
export const discoveryProfiles = [
  {
    id: "redeemer",
    name: "Redeemer",
    age: 22,
    title: "BSIT Student",
    location: "Cagayan de Oro, PH",
    distance: "1 mile away",
    avatar: teamPhotos.redeemer,
    bio: "Group creator and part-time bug hunter. Fueled by coffee and one more console.log.",
    images: [teamPhotos.redeemer],
    tags: ["Coding", "Coffee", "Gaming"],
    prompts: [
      {
        question: "A perfect Sunday looks like",
        answer: "Zero errors in the terminal and a very long nap.",
      },
      {
        question: "Together we could",
        answer: "Finally finish the project before the deadline.",
      },
    ],
  },
  {
    id: "jastin",
    name: "Jastin",
    age: 23,
    title: "BSIT Student",
    location: "Cagayan de Oro, PH",
    distance: "2 miles away",
    avatar: teamPhotos.jastin,
    bio: "Code by day, snacks by night. Ask me about my git commits (I will say 'fix').",
    images: [teamPhotos.jastin],
    tags: ["Tech", "Music", "Late Night"],
    prompts: [
      {
        question: "My most controversial opinion",
        answer: "Tabs are better than spaces, fight me.",
      },
      {
        question: "Green flag I look for",
        answer: "You reply to the group chat on time.",
      },
    ],
  },
  {
    id: "jennifer",
    name: "Jennifer",
    age: 22,
    title: "BSIT Student",
    location: "Cagayan de Oro, PH",
    distance: "3 miles away",
    avatar: teamPhotos.jennifer,
    bio: "Professional deadline survivor. Will trade my notes for good conversation.",
    images: [teamPhotos.jennifer],
    tags: ["Design", "Movies", "Coffee"],
    prompts: [
      {
        question: "I'll know it's a match when",
        answer: "You also say 'five more minutes' and mean it.",
      },
      {
        question: "One thing I can never live without is",
        answer: "A charged phone and a working charger.",
      },
    ],
  },
  {
    id: "shenaiah",
    name: "Shenaiah",
    age: 24,
    title: "BSIT Student",
    location: "Cagayan de Oro, PH",
    distance: "4 miles away",
    avatar: teamPhotos.shenaiah,
    bio: "Here for the good vibes and the group projects that somehow work out.",
    images: [teamPhotos.shenaiah],
    tags: ["Travel", "Photography", "Music"],
    prompts: [
      {
        question: "The best way to win me over is",
        answer: "Bring snacks to our group meeting.",
      },
      {
        question: "Unpopular opinion",
        answer: "Group projects are secretly fun.",
      },
    ],
  },
  {
    id: "tthrystan",
    name: "Tthrystan",
    age: 23,
    title: "BSIT Student",
    location: "Cagayan de Oro, PH",
    distance: "5 miles away",
    avatar: teamPhotos.tthrystan,
    bio: "Calm on the outside, debugging on the inside. Always down for a quick game after class.",
    images: [teamPhotos.tthrystan],
    tags: ["Gaming", "Tech", "Fitness"],
    prompts: [
      {
        question: "Together we could",
        answer: "Win the group project and the late-night game.",
      },
      {
        question: "A perfect Sunday looks like",
        answer: "No deadlines, no alarms, only rest.",
      },
    ],
  },
];

export const newSparks = discoveryProfiles.map((p) => ({
  id: p.id,
  name: p.name,
  avatar: p.avatar,
}));

export const secretAdmirers = [
  { id: "a1", avatar: "https://i.pravatar.cc/300?img=5", locked: true },
  { id: "a2", avatar: "https://i.pravatar.cc/300?img=8", locked: true },
  { id: "a3", avatar: "https://i.pravatar.cc/300?img=15", locked: true },
  {
    id: "a4",
    avatar: "https://i.pravatar.cc/300?img=21",
    locked: true,
    isUnlockAll: true,
  },
];

export const chatThreads = {
  jennifer: {
    id: "jennifer",
    name: "Jennifer",
    avatar: teamPhotos.jennifer,
    online: true,
    matchedOn: "TODAY",
    messages: [
      {
        id: "m1",
        from: "them",
        text: "Hey! Did you finish your part of the IT313 project? 😅",
        time: "10:02 AM",
      },
      {
        id: "m2",
        from: "me",
        text: "Almost! Just fixing one last bug",
        time: "10:05 AM",
        read: true,
      },
      {
        id: "m3",
        from: "them",
        text: "Classic. What was the bug this time?",
        time: "10:06 AM",
      },
      {
        id: "m4",
        from: "me",
        text: "A missing question mark. Always a question mark.",
        time: "10:10 AM",
        read: true,
      },
      {
        id: "m5",
        from: "them",
        text: "Haha okay, send it when it works. We can test it together",
        time: "10:12 AM",
      },
    ],
  },
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
