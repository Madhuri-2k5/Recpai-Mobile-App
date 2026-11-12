export interface CommunityPost {
  id: string;
  author: string;
  avatar: number;
  timeAgo: string;
  text: string;
  image?: number;
  likes: number;
  comments: number;
  hashtags: string[];
  liked?: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  participants: number;
  days: number;
  progress: number;
  completed: boolean;
  reward: string;
}

export interface Group {
  id: string;
  name: string;
  kind: 'Friends' | 'Family';
  members: number;
  sharedRecipes: number;
  avatars: number[];
}

export interface RecipeHistoryItem {
  recipeId: string;
  cookedOn: string;
}

const avatar = require('@/assets/images/avatar.jpg');

export const communityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'HealthyFoodie',
    avatar,
    timeAgo: '2h ago',
    text: 'Loving this high-protein breakfast!\n5 ingredients, 15 minutes and 32g of protein 💜',
    image: require('@/assets/recipes/berry-oats.jpg'),
    likes: 248,
    comments: 32,
    hashtags: ['#HighProtein', '#Breakfast', '#HealthyLiving'],
  },
  {
    id: 'post-2',
    author: 'FitChefAnna',
    avatar,
    timeAgo: '4h ago',
    text: 'Just completed the 7-day healthy cooking challenge! Feeling amazing 🙌',
    likes: 189,
    comments: 21,
    hashtags: ['#7DayChallenge'],
  },
  {
    id: 'post-3',
    author: 'MealPrepMax',
    avatar,
    timeAgo: '6h ago',
    text: 'Sunday meal prep done — 5 lunches under 500 kcal each. Scan. Cook. Repeat.',
    image: require('@/assets/recipes/grilled-chicken-bowl.jpg'),
    likes: 312,
    comments: 47,
    hashtags: ['#MealPrep', '#HighProtein'],
  },
];

export const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    name: '7-Day Healthy Cooking Challenge',
    description: 'Cook one healthy home-made meal every day for a week.',
    participants: 1284,
    days: 7,
    progress: 7,
    completed: true,
    reward: 'Challenge badge + 200 points',
  },
  {
    id: 'challenge-2',
    name: '30-Day Protein Power',
    description: 'Hit your daily protein target for 30 days straight.',
    participants: 862,
    days: 30,
    progress: 12,
    completed: false,
    reward: 'Premium month + exclusive badge',
  },
  {
    id: 'challenge-3',
    name: 'Meatless Mondays',
    description: 'Go plant-based every Monday for a month.',
    participants: 540,
    days: 28,
    progress: 3,
    completed: false,
    reward: 'Recipe book discount',
  },
];

export const groups: Group[] = [
  {
    id: 'group-1',
    name: 'Family Recipes',
    kind: 'Family',
    members: 5,
    sharedRecipes: 18,
    avatars: [avatar, avatar, avatar],
  },
  {
    id: 'group-2',
    name: 'Gym Buddies',
    kind: 'Friends',
    members: 8,
    sharedRecipes: 32,
    avatars: [avatar, avatar, avatar],
  },
  {
    id: 'group-3',
    name: 'College Friends',
    kind: 'Friends',
    members: 6,
    sharedRecipes: 9,
    avatars: [avatar, avatar],
  },
];

export const recipeHistory: RecipeHistoryItem[] = [
  { recipeId: 'grilled-chicken-bowl', cookedOn: 'Today' },
  { recipeId: 'mediterranean-quinoa-bowl', cookedOn: 'Yesterday' },
  { recipeId: 'salmon-plate', cookedOn: '2 days ago' },
  { recipeId: 'berry-oats', cookedOn: '3 days ago' },
];
