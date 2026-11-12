export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  kcal: number;
}

export interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: number;
  tags: string[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  timeMinutes: number;
  servings: number;
  confidence: number;
  ingredients: RecipeIngredient[];
  groceries: GroceryItem[];
  steps: string[];
}

export const recipes: Recipe[] = [
  {
    id: 'grilled-chicken-bowl',
    name: 'Grilled Chicken Bowl',
    image: require('@/assets/recipes/grilled-chicken-bowl.jpg'),
    tags: ['High Protein', 'Healthy'],
    kcal: 520,
    protein: 42,
    carbs: 65,
    fat: 14,
    timeMinutes: 25,
    servings: 1,
    confidence: 98,
    ingredients: [
      { name: 'Chicken breast', quantity: 150, unit: 'g', kcal: 248 },
      { name: 'Quinoa', quantity: 100, unit: 'g', kcal: 120 },
      { name: 'Avocado', quantity: 50, unit: 'g', kcal: 80 },
      { name: 'Cherry tomatoes', quantity: 100, unit: 'g', kcal: 18 },
      { name: 'Olive oil', quantity: 1, unit: 'tsp', kcal: 40 },
    ],
    groceries: [
      { name: 'Chicken breast', quantity: 200, unit: 'g' },
      { name: 'Quinoa', quantity: 150, unit: 'g' },
      { name: 'Avocado', quantity: 1, unit: 'pc' },
      { name: 'Cherry tomatoes', quantity: 150, unit: 'g' },
      { name: 'Olive oil', quantity: 1, unit: 'bottle' },
      { name: 'Mixed greens', quantity: 100, unit: 'g' },
    ],
    steps: [
      'Rinse the quinoa and cook it in 2 cups of salted water for 15 minutes until fluffy.',
      'Season the chicken breast with paprika, garlic powder, salt and pepper.',
      'Grill the chicken on medium-high heat for 6-7 minutes per side until golden and cooked through.',
      'Halve the cherry tomatoes and slice the avocado while the chicken rests.',
      'Slice the grilled chicken into strips.',
      'Assemble the bowl with quinoa as the base, then add greens, tomatoes, avocado and chicken. Drizzle with olive oil and serve.',
    ],
  },
  {
    id: 'mediterranean-quinoa-bowl',
    name: 'Mediterranean Quinoa Bowl',
    image: require('@/assets/recipes/mediterranean-quinoa.jpg'),
    tags: ['Vegan', 'High Fiber'],
    kcal: 480,
    protein: 18,
    carbs: 72,
    fat: 16,
    timeMinutes: 20,
    servings: 2,
    confidence: 96,
    ingredients: [
      { name: 'Quinoa', quantity: 180, unit: 'g', kcal: 220 },
      { name: 'Chickpeas', quantity: 120, unit: 'g', kcal: 110 },
      { name: 'Cucumber', quantity: 100, unit: 'g', kcal: 16 },
      { name: 'Cherry tomatoes', quantity: 100, unit: 'g', kcal: 18 },
      { name: 'Tahini dressing', quantity: 2, unit: 'tbsp', kcal: 116 },
    ],
    groceries: [
      { name: 'Quinoa', quantity: 250, unit: 'g' },
      { name: 'Chickpeas', quantity: 1, unit: 'can' },
      { name: 'Cucumber', quantity: 1, unit: 'pc' },
      { name: 'Cherry tomatoes', quantity: 200, unit: 'g' },
      { name: 'Tahini', quantity: 1, unit: 'jar' },
      { name: 'Lemon', quantity: 2, unit: 'pc' },
    ],
    steps: [
      'Cook the quinoa in salted water for 15 minutes, then fluff with a fork and let it cool.',
      'Drain and rinse the chickpeas, then toast them in a dry pan for 3 minutes with cumin.',
      'Dice the cucumber and halve the cherry tomatoes.',
      'Whisk tahini with lemon juice, garlic and a splash of water until pourable.',
      'Toss everything together in a large bowl, drizzle with the dressing and serve chilled.',
    ],
  },
  {
    id: 'berry-oats',
    name: 'Berry Oatmeal Bowl',
    image: require('@/assets/recipes/berry-oats.jpg'),
    tags: ['Breakfast', 'High Fiber'],
    kcal: 390,
    protein: 14,
    carbs: 58,
    fat: 12,
    timeMinutes: 10,
    servings: 1,
    confidence: 97,
    ingredients: [
      { name: 'Rolled oats', quantity: 60, unit: 'g', kcal: 228 },
      { name: 'Mixed berries', quantity: 100, unit: 'g', kcal: 45 },
      { name: 'Banana', quantity: 60, unit: 'g', kcal: 53 },
      { name: 'Almond butter', quantity: 1, unit: 'tbsp', kcal: 64 },
    ],
    groceries: [
      { name: 'Rolled oats', quantity: 500, unit: 'g' },
      { name: 'Mixed berries', quantity: 200, unit: 'g' },
      { name: 'Banana', quantity: 1, unit: 'bunch' },
      { name: 'Almond butter', quantity: 1, unit: 'jar' },
      { name: 'Honey', quantity: 1, unit: 'bottle' },
    ],
    steps: [
      'Simmer the oats with 1 cup of milk for 5 minutes, stirring occasionally.',
      'Slice the banana and rinse the berries.',
      'Pour the oats into a bowl and top with berries and banana.',
      'Drizzle with almond butter and honey before serving.',
    ],
  },
  {
    id: 'salmon-plate',
    name: 'Grilled Salmon Plate',
    image: require('@/assets/recipes/salmon-plate.jpg'),
    tags: ['High Protein', 'Omega-3'],
    kcal: 560,
    protein: 45,
    carbs: 32,
    fat: 28,
    timeMinutes: 30,
    servings: 2,
    confidence: 95,
    ingredients: [
      { name: 'Salmon fillet', quantity: 220, unit: 'g', kcal: 320 },
      { name: 'Baby potatoes', quantity: 150, unit: 'g', kcal: 115 },
      { name: 'Asparagus', quantity: 100, unit: 'g', kcal: 20 },
      { name: 'Butter', quantity: 10, unit: 'g', kcal: 72 },
      { name: 'Lemon', quantity: 0.5, unit: 'pc', kcal: 33 },
    ],
    groceries: [
      { name: 'Salmon fillet', quantity: 300, unit: 'g' },
      { name: 'Baby potatoes', quantity: 250, unit: 'g' },
      { name: 'Asparagus', quantity: 150, unit: 'g' },
      { name: 'Butter', quantity: 1, unit: 'pack' },
      { name: 'Lemon', quantity: 2, unit: 'pc' },
    ],
    steps: [
      'Boil the baby potatoes in salted water for 12 minutes until tender.',
      'Season the salmon with salt, pepper and a squeeze of lemon.',
      'Sear the salmon skin-side down for 4 minutes, flip and cook for 3 more minutes.',
      'Sauté the asparagus in butter for 3 minutes until crisp-tender.',
      'Plate the salmon with potatoes and asparagus, finish with lemon zest.',
    ],
  },
  {
    id: 'avocado-toast',
    name: 'Avocado Toast & Eggs',
    image: require('@/assets/recipes/avocado-toast.jpg'),
    tags: ['Breakfast', 'Quick'],
    kcal: 420,
    protein: 20,
    carbs: 38,
    fat: 22,
    timeMinutes: 12,
    servings: 1,
    confidence: 99,
    ingredients: [
      { name: 'Sourdough bread', quantity: 2, unit: 'slice', kcal: 180 },
      { name: 'Avocado', quantity: 70, unit: 'g', kcal: 112 },
      { name: 'Eggs', quantity: 2, unit: 'pc', kcal: 128 },
    ],
    groceries: [
      { name: 'Sourdough bread', quantity: 1, unit: 'loaf' },
      { name: 'Avocado', quantity: 2, unit: 'pc' },
      { name: 'Eggs', quantity: 6, unit: 'pc' },
      { name: 'Chili flakes', quantity: 1, unit: 'jar' },
    ],
    steps: [
      'Toast the sourdough slices until golden.',
      'Mash the avocado with salt, pepper and a squeeze of lemon.',
      'Fry or poach the eggs to your liking.',
      'Spread the avocado on the toast, top with the eggs and finish with chili flakes.',
    ],
  },
  {
    id: 'green-salad',
    name: 'Green Detox Salad',
    image: require('@/assets/recipes/green-salad.jpg'),
    tags: ['Vegan', 'Low Carb'],
    kcal: 210,
    protein: 8,
    carbs: 18,
    fat: 12,
    timeMinutes: 15,
    servings: 2,
    confidence: 94,
    ingredients: [
      { name: 'Baby spinach', quantity: 100, unit: 'g', kcal: 23 },
      { name: 'Broccoli', quantity: 120, unit: 'g', kcal: 41 },
      { name: 'Green beans', quantity: 100, unit: 'g', kcal: 35 },
      { name: 'Pumpkin seeds', quantity: 20, unit: 'g', kcal: 56 },
      { name: 'Olive oil', quantity: 1, unit: 'tbsp', kcal: 55 },
    ],
    groceries: [
      { name: 'Baby spinach', quantity: 200, unit: 'g' },
      { name: 'Broccoli', quantity: 1, unit: 'head' },
      { name: 'Green beans', quantity: 200, unit: 'g' },
      { name: 'Pumpkin seeds', quantity: 1, unit: 'pack' },
    ],
    steps: [
      'Blanch the broccoli and green beans for 2 minutes, then shock in ice water.',
      'Toast the pumpkin seeds in a dry pan until they pop.',
      'Whisk olive oil with lemon juice, salt and mustard for the dressing.',
      'Toss the greens with the dressing and top with seeds.',
    ],
  },
];

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.id === id);
}

const NON_SCALING_UNITS = new Set(['bottle', 'jar', 'pack', 'loaf', 'bunch', 'can', 'head']);

export function scaleQuantity(quantity: number, unit: string, servings: number): string {
  if (NON_SCALING_UNITS.has(unit)) {
    return `${quantity} ${unit}`;
  }
  const scaled = quantity * servings;
  if (unit === 'pc' || unit === 'slice' || unit === 'tsp' || unit === 'tbsp') {
    return `${Number.isInteger(scaled) ? scaled : scaled.toFixed(1)} ${unit}`;
  }
  return `${Number.isInteger(scaled) ? scaled : Math.round(scaled)} ${unit}`;
}
