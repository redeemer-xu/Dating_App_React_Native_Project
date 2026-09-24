
export const currentUser = {
  id: 'me',
  avatar: 'https://i.pravatar.cc/150?img=68',
};

export const defaultDiscoveryFilters = {
  distance: 25,
  ageRange: [22, 32],
  showMe: 'Everyone',
  verifiedOnly: false,
};

export const discoveryProfiles = [
  {
    id: 'maya',
    name: 'Maya',
    age: 26,
    title: 'Interior Designer',
    location: 'London, UK',
    distance: '3 miles away',
    bio: "Turning empty rooms into stories. Always chasing golden hour and good coffee. Let's argue about mid-century furniture.",
    images: [
      'https://picsum.photos/seed/maya1/900/1400',
      'https://picsum.photos/seed/maya2/900/1400',
    ],
    tags: ['Vintage Hunting', 'Architecture', 'Late Night', 'Coffee Snob'],
    prompts: [
      { question: 'A perfect Sunday looks like', answer: 'Flea market run, then getting lost restoring a chair I definitely did not need.' },
      { question: "I'll know it's a match when", answer: 'You have strong opinions about lighting.' },
    ],
  },
  {
    id: 'leo',
    name: 'Leo',
    age: 29,
    title: 'Software Engineer',
    location: 'London, UK',
    distance: '5 miles away',
    bio: 'Building things by day, climbing things by weekend. Looking for a partner in crime for terrible puns.',
    images: [
      'https://picsum.photos/seed/leo1/900/1400',
      'https://picsum.photos/seed/leo2/900/1400',
    ],
    tags: ['Bouldering', 'Board Games', 'Terrible Puns'],
    prompts: [
      { question: 'My most controversial opinion', answer: 'Pineapple belongs on pizza, fight me.' },
      { question: 'Together we could', answer: 'Finally beat that escape room that beat us twice.' },
    ],
  },
  {
    id: 'jules',
    name: 'Jules',
    age: 24,
    title: 'Photographer',
    location: 'London, UK',
    distance: '1 mile away',
    bio: 'I see the world in frames. Currently obsessed with film photography and oat milk lattes.',
    images: [
      'https://picsum.photos/seed/jules1/900/1400',
      'https://picsum.photos/seed/jules2/900/1400',
    ],
    tags: ['Film Photography', 'Indie Music', 'Thrifting'],
    prompts: [
      { question: 'Green flag I look for', answer: 'You get excited about small things.' },
      { question: 'Unpopular opinion', answer: 'Digital photos have no soul.' },
    ],
  },
];

export const newSparks = [
  { id: 'leo', name: 'Leo', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'maya', name: 'Maya', avatar: 'https://i.pravatar.cc/150?img=32' },
  { id: 'jules', name: 'Jules', avatar: 'https://i.pravatar.cc/150?img=25' },
  { id: 'noah', name: 'Noah', avatar: 'https://i.pravatar.cc/150?img=14' },
  { id: 'ivy', name: 'Ivy', avatar: 'https://i.pravatar.cc/150?img=47' },
];

export const secretAdmirers = [
  { id: 'a1', avatar: 'https://i.pravatar.cc/300?img=5', locked: true },
  { id: 'a2', avatar: 'https://i.pravatar.cc/300?img=8', locked: true },
  { id: 'a3', avatar: 'https://i.pravatar.cc/300?img=15', locked: true },
  { id: 'a4', avatar: 'https://i.pravatar.cc/300?img=21', locked: true, isUnlockAll: true },
];

export const chatThreads = {
  maya: {
    id: 'maya',
    name: 'Maya',
    avatar: 'https://i.pravatar.cc/150?img=32',
    online: true,
    matchedOn: 'TODAY',
    messages: [
      { id: 'm1', from: 'them', text: "Hey! Loved your record collection in the photos 🎧", time: '10:02 AM' },
      { id: 'm2', from: 'me', text: 'Ha, thank you! It might be a slight problem at this point', time: '10:05 AM', read: true },
      { id: 'm3', from: 'them', text: "No such thing as too many records. What's the last one you picked up?", time: '10:06 AM' },
      {
        id: 'm4',
        from: 'me',
        text: 'This one, found it at a tiny shop near Brick Lane',
        time: '10:10 AM',
        read: true,
        image: 'https://picsum.photos/seed/vinyl/500/500',
      },
      { id: 'm5', from: 'them', text: 'Okay that shop has amazing taste. We need to go together sometime', time: '10:12 AM' },
    ],
  },
};

export const profiles = {
  maya: discoveryProfiles[0],
  leo: discoveryProfiles[1],
  jules: discoveryProfiles[2],
};

export const interestOptions = [
  'Art',
  'Travel',
  'Music',
  'Cooking',
  'Movies',
  'Fitness',
  'Books',
  'Gaming',
  'Photography',
  'Outdoors',
  'Pets',
  'Coffee',
  'Tech',
  'Fashion',
  'Volunteering',
  'Writing',
  'Hiking',
  'Learning',
  'Podcasts',
  'Nightlife',
];

export const promptQuestions = [
  'A perfect Sunday looks like',
  "I'll know it's a match when",
  'My most controversial opinion',
  'Together we could',
  'Green flag I look for',
  'Unpopular opinion',
  'The best way to win me over is',
  'One thing I can never live without is',
];
