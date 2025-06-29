export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  reviews: number;
  author: User;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  dietaryInfo: string[];
  createdAt: string;
  isBookmarked?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  recipes: number;
  isFollowing?: boolean;
  dietaryPreferences: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: 'sarahcooks',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'Home chef passionate about healthy, delicious meals 🥗',
    followers: 1234,
    following: 456,
    recipes: 89,
    isFollowing: false,
    dietaryPreferences: ['Vegetarian', 'Gluten-free'],
    skillLevel: 'Intermediate',
  },
  {
    id: '2',
    name: 'Marco Rodriguez',
    username: 'marcoeats',
    avatar: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'Italian cuisine enthusiast | Food photographer 📸',
    followers: 2567,
    following: 234,
    recipes: 156,
    isFollowing: true,
    dietaryPreferences: ['Mediterranean'],
    skillLevel: 'Advanced',
  },
  {
    id: '3',
    name: 'Emily Chen',
    username: 'emilyskitchen',
    avatar: 'https://images.pexels.com/photos/3866555/pexels-photo-3866555.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'Quick & easy recipes for busy professionals ⏰',
    followers: 3456,
    following: 678,
    recipes: 234,
    isFollowing: true,
    dietaryPreferences: ['Vegan', 'Low-carb'],
    skillLevel: 'Intermediate',
  },
];

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Mediterranean Quinoa Bowl',
    description: 'A colorful, nutrient-packed bowl with quinoa, roasted vegetables, and tahini dressing.',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    cookTime: 25,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 127,
    author: mockUsers[0],
    ingredients: [
      '1 cup quinoa',
      '2 cups vegetable broth',
      '1 red bell pepper, diced',
      '1 cucumber, diced',
      '1/2 red onion, sliced',
      '1/4 cup tahini',
      '2 tbsp lemon juice',
      '2 tbsp olive oil',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Rinse quinoa and cook in vegetable broth for 15 minutes.',
      'Meanwhile, prepare all vegetables.',
      'Make tahini dressing by mixing tahini, lemon juice, and olive oil.',
      'Combine cooked quinoa with vegetables.',
      'Drizzle with dressing and serve immediately.'
    ],
    tags: ['Healthy', 'Quick', 'Mediterranean'],
    dietaryInfo: ['Vegetarian', 'Vegan', 'Gluten-free'],
    createdAt: '2024-01-15',
    isBookmarked: true,
  },
  {
    id: '2',
    title: 'Classic Margherita Pizza',
    description: 'Authentic Italian pizza with fresh mozzarella, basil, and San Marzano tomatoes.',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600',
    cookTime: 45,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 203,
    author: mockUsers[1],
    ingredients: [
      '400g pizza dough',
      '200g San Marzano tomatoes',
      '200g fresh mozzarella',
      'Fresh basil leaves',
      '2 tbsp olive oil',
      '1 tsp salt',
      '1/2 tsp black pepper'
    ],
    instructions: [
      'Preheat oven to 475°F (245°C).',
      'Roll out pizza dough on floured surface.',
      'Spread crushed tomatoes evenly on dough.',
      'Add torn mozzarella pieces.',
      'Bake for 12-15 minutes until golden.',
      'Top with fresh basil and drizzle with olive oil.'
    ],
    tags: ['Italian', 'Classic', 'Comfort Food'],
    dietaryInfo: ['Vegetarian'],
    createdAt: '2024-01-14',
    isBookmarked: false,
  },
  {
    id: '3',
    title: 'Asian Fusion Stir Fry',
    description: 'Quick and flavorful stir fry with seasonal vegetables and aromatic sauces.',
    image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=600',
    cookTime: 15,
    servings: 3,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 89,
    author: mockUsers[2],
    ingredients: [
      '2 cups mixed vegetables',
      '2 tbsp soy sauce',
      '1 tbsp sesame oil',
      '2 cloves garlic, minced',
      '1 inch ginger, grated',
      '2 green onions, sliced',
      '1 tbsp vegetable oil'
    ],
    instructions: [
      'Heat vegetable oil in wok or large pan.',
      'Add garlic and ginger, stir for 30 seconds.',
      'Add vegetables and stir fry for 3-4 minutes.',
      'Add soy sauce and sesame oil.',
      'Garnish with green onions and serve.'
    ],
    tags: ['Asian', 'Quick', 'Healthy'],
    dietaryInfo: ['Vegan', 'Low-carb'],
    createdAt: '2024-01-13',
    isBookmarked: true,
  },
];

export const currentUser: User = {
  id: 'current',
  name: 'Alex Thompson',
  username: 'alexcooks',
  avatar: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  bio: 'Cooking enthusiast | Learning every day 👨‍🍳',
  followers: 567,
  following: 123,
  recipes: 45,
  dietaryPreferences: ['Vegetarian'],
  skillLevel: 'Beginner',
};