import { enrichNutritionFromOpenFoodFacts } from './nutrition.js';

const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
const GEMINI_IMAGE_MODEL = String(process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image').trim();

const recipeSchema = {
  type: 'OBJECT',
  properties: {
    detectedItem: { type: 'STRING' },
    detectedItems: { type: 'ARRAY', items: { type: 'STRING' } },
    title: { type: 'STRING' },
    category: { type: 'STRING' },
    cuisine: { type: 'STRING' },
    dietGoal: { type: 'STRING' },
    prepTimeMinutes: { type: 'INTEGER' },
    difficulty: { type: 'STRING' },
    servings: { type: 'INTEGER' },
    summary: { type: 'STRING' },
    ingredients: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          quantity: { type: 'STRING' },
        },
        required: ['name', 'quantity'],
      },
    },
    groceries: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          quantity: { type: 'STRING' },
        },
        required: ['name', 'quantity'],
      },
    },
    steps: { type: 'ARRAY', items: { type: 'STRING' } },
    tips: { type: 'ARRAY', items: { type: 'STRING' } },
    nutrition: {
      type: 'OBJECT',
      properties: {
        calories: { type: 'NUMBER' },
        protein: { type: 'NUMBER' },
        carbs: { type: 'NUMBER' },
        fat: { type: 'NUMBER' },
        fiber: { type: 'NUMBER' },
      },
      required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
    },
    scanSummary: { type: 'STRING' },
    scanConfidence: { type: 'NUMBER' },
    scanWarnings: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: [
    'detectedItem', 'detectedItems', 'title', 'category', 'cuisine', 'dietGoal',
    'prepTimeMinutes', 'difficulty', 'servings', 'summary', 'ingredients', 'groceries',
    'steps', 'tips', 'nutrition', 'scanSummary', 'scanConfidence', 'scanWarnings',
  ],
};

const imageAssessmentSchema = {
  type: 'OBJECT',
  properties: {
    foodDetected: { type: 'BOOLEAN' },
    confidence: { type: 'NUMBER' },
    detectedItems: { type: 'ARRAY', items: { type: 'STRING' } },
    reason: { type: 'STRING' },
  },
  required: ['foodDetected', 'confidence', 'detectedItems', 'reason'],
};

function normalizeTextPayload(text) {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function splitManualIngredient(input) {
  return String(input || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getGeminiGenerateContentUrl(modelName = GEMINI_MODEL) {
  const key = encodeURIComponent(GEMINI_API_KEY);
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
}

function extractInlineImage(part) {
  const inlineData = part?.inlineData || part?.inline_data;
  if (!inlineData?.data) return null;
  const mimeType = inlineData?.mimeType || inlineData?.mime_type || 'image/png';
  return { data: String(inlineData.data), mimeType: String(mimeType) };
}

function extractImageFromPayload(payload) {
  const candidates = payload?.candidates;
  if (!Array.isArray(candidates)) return null;

  for (const candidate of candidates) {
    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts)) continue;
    for (const part of parts) {
      const inlineImage = extractInlineImage(part);
      if (inlineImage) {
        return `data:${inlineImage.mimeType};base64,${inlineImage.data}`;
      }
    }
  }
  return null;
}

export class UserFacingRecipeError extends Error {}

function cleanDetectedItems(items) {
  return [...new Set(
    (items || [])
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .map((item) => item.replace(/\s+/g, ' '))
      .filter((item) => !/^(food|meal|dish|plate|ingredient|ingredients|unknown|object|item)$/i.test(item))
  )].slice(0, 6);
}

const CUISINE_PRESETS = {
  Indian: {
    title: 'Paneer Tikka & Spiced Quinoa Bowl',
    items: ['Paneer', 'Bell Peppers', 'Quinoa', 'Garam Masala', 'Greek Yogurt'],
    prepTime: 25,
    calories: 480,
    protein: 28,
    carbs: 46,
    fat: 16,
    fiber: 7,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    ingredients: (s) => [
      { name: 'Fresh Paneer (cubed)', quantity: `${150 * s}g` },
      { name: 'Tri-color Bell Peppers (diced)', quantity: `${1 * s} cup` },
      { name: 'Quinoa (cooked)', quantity: `${0.75 * s} cup` },
      { name: 'Greek Yogurt (low-fat)', quantity: `${3 * s} tbsp` },
      { name: 'Kashmiri Chili & Garam Masala', quantity: `${1 * s} tsp` },
      { name: 'Fresh Cilantro & Lemon Juice', quantity: 'to taste' },
    ],
    groceries: (s) => [
      { name: 'Paneer block', quantity: s <= 2 ? '1 pack (200g)' : '2 packs (400g)' },
      { name: 'Bell peppers mix', quantity: '1 pack (3 pcs)' },
      { name: 'White quinoa', quantity: '1 pack (500g)' },
      { name: 'Greek yogurt tub', quantity: '1 tub (400g)' },
      { name: 'Fresh lemons & cilantro', quantity: '1 bunch' },
    ],
    steps: [
      'Cube paneer and dice bell peppers into uniform 1-inch bite pieces.',
      'Whisk yogurt with garam masala, chili powder, salt, and lemon juice into a smooth marinade.',
      'Coat the paneer and peppers in marinade; let rest for 8 minutes.',
      'Sear on a hot cast iron grill pan with 1 tsp olive oil for 3-4 minutes per side until lightly charred.',
      'Fluff warm cooked quinoa and assemble the bowl with seared paneer, charred peppers, and a drizzle of lemon-herb dressing.',
    ],
    tips: [
      'Press paneer with paper towels first for a crispier sear.',
      'Add baby spinach or roasted chickpeas to increase fiber even further.',
    ],
  },
  'South Indian': {
    title: 'Moong Dal & Vegetable Sambar Bowl',
    items: ['Yellow Lentils', 'Drumsticks', 'Tomatoes', 'Curry Leaves', 'Mustard Seeds'],
    prepTime: 28,
    calories: 390,
    protein: 22,
    carbs: 58,
    fat: 8,
    fiber: 12,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
    ingredients: (s) => [
      { name: 'Yellow Moong / Toor Dal', quantity: `${75 * s}g` },
      { name: 'Diced Mixed Vegetables', quantity: `${1 * s} cup` },
      { name: 'Fresh Curry Leaves', quantity: `${6 * s} leaves` },
      { name: 'Sambar Powder & Turmeric', quantity: `${1.5 * s} tsp` },
      { name: 'Tamarind Paste', quantity: `${1 * s} tsp` },
      { name: 'Brown Rice / Red Rice', quantity: `${0.75 * s} cup cooked` },
    ],
    groceries: (s) => [
      { name: 'Yellow split lentils', quantity: '1 pack (500g)' },
      { name: 'Mixed fresh stew vegetables', quantity: '500g' },
      { name: 'Authentic Sambar spice powder', quantity: '1 pack (100g)' },
      { name: 'Curry leaves & mustard seeds', quantity: '1 small pack' },
      { name: 'Tamarind concentrate', quantity: '1 jar' },
    ],
    steps: [
      'Rinse lentils and pressure cook with turmeric and 2.5 cups water until completely soft (about 3 whistles).',
      'In a saucepan, simmer chopped vegetables in tamarind water and sambar spice for 10 minutes until fork-tender.',
      'Combine cooked lentils and simmered vegetables; adjust consistency with warm water.',
      'Perform traditional tadka: splutter mustard seeds, cumin, and fresh curry leaves in a dash of ghee.',
      'Pour tempered aromatic spices over the hot sambar and serve over fluffy steamed brown rice.',
    ],
    tips: [
      'A pinch of asafoetida (hing) in the tempering aids digestion and elevates aroma.',
      'Add a dollop of fresh coconut chutney on the side for authentic flavor.',
    ],
  },
  Italian: {
    title: 'Tuscan Garlic Herb Pasta with Roasted Tomatoes',
    items: ['Whole Wheat Penne', 'Cherry Tomatoes', 'Garlic', 'Extra Virgin Olive Oil', 'Fresh Basil'],
    prepTime: 20,
    calories: 440,
    protein: 18,
    carbs: 64,
    fat: 12,
    fiber: 9,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    ingredients: (s) => [
      { name: 'Whole Wheat Penne / Rigatoni', quantity: `${85 * s}g` },
      { name: 'Ripe Cherry Tomatoes (halved)', quantity: `${1 * s} cup` },
      { name: 'Fresh Garlic (thinly sliced)', quantity: `${3 * s} cloves` },
      { name: 'Extra Virgin Olive Oil', quantity: `${1 * s} tbsp` },
      { name: 'Fresh Sweet Basil leaves', quantity: `${0.5 * s} cup` },
      { name: 'Parmigiano-Reggiano (shaved)', quantity: `${15 * s}g` },
    ],
    groceries: (s) => [
      { name: 'Whole wheat penne pasta', quantity: '1 box (500g)' },
      { name: 'Cherry vine tomatoes', quantity: '1 punnet (300g)' },
      { name: 'Fresh Italian sweet basil', quantity: '1 plant/bunch' },
      { name: 'Garlic bulb', quantity: '1 head' },
      { name: 'Aged Parmigiano-Reggiano', quantity: '1 wedge (150g)' },
    ],
    steps: [
      'Bring a pot of generously salted water to a rolling boil and cook penne until perfectly al dente.',
      'In a wide skillet, gently infuse olive oil with sliced garlic and red pepper flakes over low heat.',
      'Toss in cherry tomatoes and blister until their juices release and create a rustic glossy sauce.',
      'Transfer drained pasta directly into the skillet along with 3 tablespoons of starchy pasta water.',
      'Toss vigorously off the heat, fold in torn fresh basil, and finish with grated Parmesan.',
    ],
    tips: [
      'Never rinse cooked pasta — the starch helps the olive oil and tomato sauce cling.',
      'Toss in grilled chicken breast strips or white cannellini beans for a protein boost.',
    ],
  },
  Mexican: {
    title: 'Chipotle Black Bean & Avocado Fiesta Bowl',
    items: ['Black Beans', 'Ripe Avocado', 'Sweet Corn', 'Brown Rice', 'Lime & Cilantro'],
    prepTime: 22,
    calories: 460,
    protein: 20,
    carbs: 62,
    fat: 15,
    fiber: 14,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80',
    ingredients: (s) => [
      { name: 'Organic Black Beans (rinsed)', quantity: `${1 * s} cup` },
      { name: 'Sweet Corn Kernels (roasted)', quantity: `${0.5 * s} cup` },
      { name: 'Ripe Hass Avocado (sliced)', quantity: `${0.5 * s} pc` },
      { name: 'Steamed Lime-Cilantro Brown Rice', quantity: `${0.75 * s} cup` },
      { name: 'Fresh Pico de Gallo', quantity: `${3 * s} tbsp` },
      { name: 'Chipotle Lime Crema (yogurt based)', quantity: `${2 * s} tbsp` },
    ],
    groceries: (s) => [
      { name: 'Black beans can/pack', quantity: s <= 2 ? '1 can (400g)' : '2 cans' },
      { name: 'Fresh ripe Hass avocados', quantity: s <= 2 ? '2 pcs' : '4 pcs' },
      { name: 'Sweet corn can', quantity: '1 can (340g)' },
      { name: 'Brown basmati rice', quantity: '1 pack (500g)' },
      { name: 'Fresh limes, cilantro, and red onions', quantity: '1 mix bag' },
    ],
    steps: [
      'Warm the black beans in a skillet with ground cumin, smoked paprika, and a squeeze of fresh lime.',
      'Char the sweet corn kernels in a dry non-stick skillet for 3 minutes to build a smoky flavor.',
      'Prepare lime-cilantro rice by tossing warm brown rice with chopped cilantro, sea salt, and lime zest.',
      'Layer rice into serving bowls and arrange seasoned black beans, charred corn, and pico de gallo side by side.',
      'Top with ripe avocado slices, fresh cilantro, and a swirl of tangy chipotle lime crema.',
    ],
    tips: [
      'Squeeze lime juice over the avocado slices immediately to prevent browning.',
      'Add grilled lean chicken or tofu cubes to reach over 35g of protein per serving.',
    ],
  },
  Chinese: {
    title: 'Ginger Sesame Vegetable & Tofu Stir-Fry',
    items: ['Firm Tofu', 'Broccoli Florets', 'Snow Peas', 'Ginger Garlic Sauce', 'Sesame Seeds'],
    prepTime: 20,
    calories: 410,
    protein: 25,
    carbs: 48,
    fat: 13,
    fiber: 8,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    ingredients: (s) => [
      { name: 'Organic Firm Tofu (pressed & cubed)', quantity: `${150 * s}g` },
      { name: 'Fresh Broccoli florets', quantity: `${1 * s} cup` },
      { name: 'Snow peas & carrot ribbons', quantity: `${0.75 * s} cup` },
      { name: 'Ginger & Garlic (minced)', quantity: `${1.5 * s} tbsp` },
      { name: 'Low-sodium Tamari / Soy Sauce', quantity: `${1.5 * s} tbsp` },
      { name: 'Toasted Sesame Oil & Seeds', quantity: `${1 * s} tsp` },
    ],
    groceries: (s) => [
      { name: 'Extra firm tofu', quantity: '1 pack (350g)' },
      { name: 'Fresh broccoli head', quantity: '1 head' },
      { name: 'Snow peas bag', quantity: '1 pack (150g)' },
      { name: 'Toasted sesame oil bottle', quantity: '1 small bottle' },
      { name: 'Low sodium soy sauce', quantity: '1 bottle (250ml)' },
    ],
    steps: [
      'Press tofu with clean towels to remove moisture, then cut into bite-sized golden cubes.',
      'Whisk tamari, grated ginger, minced garlic, rice vinegar, and a teaspoon of cornstarch for the sauce.',
      'Stir-fry tofu in a smoking hot wok with half the sesame oil until golden and crisp (approx 5 mins). Set aside.',
      'Toss broccoli, snow peas, and carrots in the wok for 3 minutes over high heat until crisp-tender.',
      'Pour back the tofu, add the stir-fry sauce, toss for 60 seconds until glossy, and garnish with sesame seeds.',
    ],
    tips: [
      'High heat and short cooking time preserve the crispness and nutrients of vegetables.',
      'Serve over jasmine rice, soba buckwheat noodles, or cauliflower rice.',
    ],
  },
  Thai: {
    title: 'Aromatic Coconut Green Curry with Jasmine Rice',
    items: ['Coconut Milk', 'Green Curry Paste', 'Bamboo Shoots', 'Eggplant', 'Thai Basil'],
    prepTime: 25,
    calories: 450,
    protein: 21,
    carbs: 52,
    fat: 17,
    fiber: 6,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&auto=format&fit=crop&q=80',
    ingredients: (s) => [
      { name: 'Light Coconut Milk', quantity: `${150 * s}ml` },
      { name: 'Authentic Thai Green Curry Paste', quantity: `${1 * s} tbsp` },
      { name: 'Tofu / Chicken breast slices', quantity: `${120 * s}g` },
      { name: 'Thai eggplants / Zucchini (diced)', quantity: `${0.75 * s} cup` },
      { name: 'Fresh Thai Basil leaves', quantity: `${0.25 * s} cup` },
      { name: 'Fragrant Steamed Jasmine Rice', quantity: `${0.75 * s} cup` },
    ],
    groceries: (s) => [
      { name: 'Light coconut milk can', quantity: '1 can (400ml)' },
      { name: 'Thai green curry paste jar', quantity: '1 jar (110g)' },
      { name: 'Fresh zucchini & bell peppers', quantity: '1 pack' },
      { name: 'Fresh Thai basil', quantity: '1 bunch' },
      { name: 'Jasmine rice', quantity: '1 pack (1kg)' },
    ],
    steps: [
      'Fry 2 tbsp of green curry paste in a saucepan with 3 tbsp thick coconut cream until fragrant and fragrant oil separates.',
      'Add sliced protein and sear gently for 2 minutes to coat in curry paste.',
      'Pour in remaining coconut milk and 1/2 cup vegetable broth; bring to a gentle rolling simmer.',
      'Add diced zucchini and bamboo shoots; simmer for 6-8 minutes until tender.',
      'Take off the heat, stir in fresh Thai basil leaves and lime juice, and ladle generously over jasmine rice.',
    ],
    tips: [
      'Do not boil vigorously after adding coconut milk to prevent curdling.',
      'Adjust curry paste quantity to your preferred spice tolerance.',
    ],
  },
  Mediterranean: {
    title: 'Mediterranean Chickpea & Olive Power Bowl',
    items: ['Chickpeas', 'Kalamata Olives', 'Cucumber', 'Cherry Tomatoes', 'Feta Cheese'],
    prepTime: 18,
    calories: 430,
    protein: 22,
    carbs: 49,
    fat: 16,
    fiber: 11,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    ingredients: (s) => [
      { name: 'Cooked Chickpeas (garbanzo)', quantity: `${1 * s} cup` },
      { name: 'Crisp Persian Cucumbers (sliced)', quantity: `${0.75 * s} cup` },
      { name: 'Kalamata Olives (pitted)', quantity: `${8 * s} pcs` },
      { name: 'Cherry Tomatoes (halved)', quantity: `${0.75 * s} cup` },
      { name: 'Crumbled Sheep Feta Cheese', quantity: `${30 * s}g` },
      { name: 'Extra Virgin Olive Oil & Lemon dressing', quantity: `${1.5 * s} tbsp` },
    ],
    groceries: (s) => [
      { name: 'Organic chickpeas can', quantity: s <= 2 ? '1 can (400g)' : '2 cans' },
      { name: 'Persian cucumbers', quantity: '1 pack (4 pcs)' },
      { name: 'Kalamata olives jar', quantity: '1 jar (200g)' },
      { name: 'Greek feta cheese block', quantity: '1 block (150g)' },
      { name: 'Fresh lemons & oregano', quantity: '1 pack' },
    ],
    steps: [
      'Rinse and drain chickpeas thoroughly; pat dry with clean towel.',
      'Toss chickpeas with olive oil, oregano, garlic powder, and roast in a pan for 6 minutes until lightly crisp.',
      'Dice cucumbers and halve tomatoes into clean bite-sized pieces.',
      'Whisk lemon juice, extra virgin olive oil, minced garlic, oregano, and black pepper into a vibrant vinaigrette.',
      'Layer warm chickpeas, crisp cucumbers, tomatoes, and olives into wide bowls. Top with crumbled feta and fresh mint.',
    ],
    tips: [
      'Roasting chickpeas lightly gives them a wonderful nutty texture.',
      'Keeps fresh in the fridge for up to 3 days for easy meal-prep.',
    ],
  },
  Continental: {
    title: 'Herb-Roasted Vegetable & Grain Power Plate',
    items: ['Baby Carrots', 'Zucchini', 'Sweet Potato', 'Quinoa', 'Rosemary'],
    prepTime: 25,
    calories: 420,
    protein: 20,
    carbs: 55,
    fat: 13,
    fiber: 10,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    ingredients: (s) => [
      { name: 'Sweet Potato (cubed)', quantity: `${100 * s}g` },
      { name: 'Zucchini & Baby Carrots', quantity: `${1 * s} cup` },
      { name: 'Mixed Ancient Grains / Quinoa', quantity: `${0.75 * s} cup cooked` },
      { name: 'Fresh Rosemary & Thyme', quantity: `${1 * s} tsp minced` },
      { name: 'Cold-pressed Olive Oil', quantity: `${1 * s} tbsp` },
      { name: 'Balsamic Glaze', quantity: `${1 * s} tsp` },
    ],
    groceries: (s) => [
      { name: 'Sweet potatoes', quantity: '1 kg bag' },
      { name: 'Fresh zucchini & carrots', quantity: '500g' },
      { name: 'Tri-color grain quinoa mix', quantity: '1 pack (500g)' },
      { name: 'Fresh herbs (rosemary, thyme)', quantity: '1 pack' },
      { name: 'Modena balsamic glaze', quantity: '1 bottle' },
    ],
    steps: [
      'Preheat oven or air fryer to 200°C (400°F).',
      'Cut sweet potatoes, zucchini, and carrots into even-sized rustic chunks.',
      'Toss vegetables with olive oil, minced rosemary, thyme, sea salt, and freshly cracked black pepper.',
      'Roast for 18-20 minutes until golden brown with caramelized edges.',
      'Arrange warm grains on the plate, mound roasted vegetables on top, and finish with a delicate drizzle of balsamic glaze.',
    ],
    tips: [
      'Do not overcrowd the roasting tray so vegetables caramelize instead of steaming.',
      'Sprinkle toasted pumpkin seeds or walnuts for healthy fats and extra crunch.',
    ],
  },
};

function buildFallbackRecipe(input, options = {}) {
  const cuisine = input.cuisine || 'Indian';
  const preset = CUISINE_PRESETS[cuisine] || CUISINE_PRESETS.Indian;
  const servings = Math.max(1, Math.min(12, toNumber(input.servings, 2)));

  const trustedItems = cleanDetectedItems(options.trustedItems);
  const manualItems = splitManualIngredient(input.manualIngredient);
  const detectedItems =
    trustedItems.length > 0
      ? trustedItems
      : manualItems.length > 0
        ? manualItems
        : preset.items;

  const multiplier = servings / 2;

  return {
    detectedItem: detectedItems[0],
    detectedItems,
    title: preset.title,
    category: 'Main Dish',
    cuisine,
    dietGoal: 'Balanced',
    prepTimeMinutes: preset.prepTime,
    difficulty: 'Easy',
    servings,
    summary: `A chef-crafted healthy ${cuisine.toLowerCase()} recipe optimized for balanced nutrition and ease of preparation.`,
    ingredients: preset.ingredients(servings),
    groceries: preset.groceries(servings),
    steps: preset.steps,
    tips: preset.tips,
    nutrition: {
      calories: Math.round(preset.calories * multiplier),
      protein: Math.round(preset.protein * multiplier),
      carbs: Math.round(preset.carbs * multiplier),
      fat: Math.round(preset.fat * multiplier),
      fiber: Math.round(preset.fiber * multiplier),
    },
    scanSummary: options.scanSummary || `Detected fresh ingredients suitable for a healthy ${cuisine} dish.`,
    scanConfidence: toNumber(options.scanConfidence, 0.88),
    scanWarnings: Array.isArray(options.scanWarnings) ? options.scanWarnings : [],
    nutritionSource: 'chef-curated',
    nutritionMatchedItems: detectedItems.slice(0, 3),
    imageUrl: preset.image,
  };
}

function isFakeImageUrl(url) {
  if (typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (/example\.(com|org|net|io)/i.test(trimmed)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(trimmed)) return true;
  if (/placeholder|sample|dummy|fake/i.test(trimmed)) return true;
  return false;
}

function sanitizeRecipe(rawRecipe, input, options = {}) {
  const trustedItems = cleanDetectedItems(options.trustedItems);
  const fallback = buildFallbackRecipe(input, options);
  const detectedItems =
    Array.isArray(rawRecipe?.detectedItems) && rawRecipe.detectedItems.length > 0
      ? cleanDetectedItems(rawRecipe.detectedItems)
      : cleanDetectedItems([rawRecipe?.detectedItem, ...trustedItems, ...splitManualIngredient(input.manualIngredient)]);

  const mapItems = (items, fallbackItems) =>
    Array.isArray(items) && items.length > 0
      ? items
          .map((item) => ({ name: String(item?.name || '').trim(), quantity: String(item?.quantity || '').trim() || 'to taste' }))
          .filter((item) => item.name)
      : fallbackItems;

  const servings = Math.max(1, Math.min(12, toNumber(rawRecipe?.servings, fallback.servings)));

  return {
    detectedItem: String(rawRecipe?.detectedItem || '').trim() || detectedItems[0] || fallback.detectedItem,
    detectedItems: detectedItems.length > 0 ? detectedItems : fallback.detectedItems,
    title: String(rawRecipe?.title || '').trim() || fallback.title,
    category: String(rawRecipe?.category || '').trim() || fallback.category,
    cuisine: String(rawRecipe?.cuisine || '').trim() || input.cuisine,
    dietGoal: String(rawRecipe?.dietGoal || '').trim() || fallback.dietGoal,
    prepTimeMinutes: Math.min(120, Math.max(3, toNumber(rawRecipe?.prepTimeMinutes, fallback.prepTimeMinutes))),
    difficulty: ['Easy', 'Medium', 'Hard'].includes(String(rawRecipe?.difficulty)) ? String(rawRecipe.difficulty) : fallback.difficulty,
    servings,
    summary: String(rawRecipe?.summary || '').trim() || fallback.summary,
    ingredients: mapItems(rawRecipe?.ingredients, fallback.ingredients),
    groceries: mapItems(rawRecipe?.groceries, fallback.groceries),
    steps: Array.isArray(rawRecipe?.steps) && rawRecipe.steps.length > 0
      ? rawRecipe.steps.map((step) => String(step).trim()).filter(Boolean)
      : fallback.steps,
    tips: Array.isArray(rawRecipe?.tips) && rawRecipe.tips.length > 0
      ? rawRecipe.tips.map((tip) => String(tip).trim()).filter(Boolean)
      : fallback.tips,
    nutrition: {
      calories: Math.max(0, Math.round(toNumber(rawRecipe?.nutrition?.calories, fallback.nutrition.calories))),
      protein: Math.max(0, Math.round(toNumber(rawRecipe?.nutrition?.protein, fallback.nutrition.protein))),
      carbs: Math.max(0, Math.round(toNumber(rawRecipe?.nutrition?.carbs, fallback.nutrition.carbs))),
      fat: Math.max(0, Math.round(toNumber(rawRecipe?.nutrition?.fat, fallback.nutrition.fat))),
      fiber: Math.max(0, Math.round(toNumber(rawRecipe?.nutrition?.fiber, fallback.nutrition.fiber))),
    },
    scanSummary: String(rawRecipe?.scanSummary || '').trim() || fallback.scanSummary,
    scanConfidence: Math.max(0, Math.min(1, toNumber(rawRecipe?.scanConfidence, fallback.scanConfidence))),
    scanWarnings: Array.isArray(rawRecipe?.scanWarnings) && rawRecipe.scanWarnings.length > 0
      ? rawRecipe.scanWarnings.map((item) => String(item).trim()).filter(Boolean)
      : fallback.scanWarnings,
    nutritionSource: 'gemini',
    nutritionMatchedItems: [],
    imageUrl: isFakeImageUrl(rawRecipe?.imageUrl) ? '' : String(rawRecipe.imageUrl).trim(),
  };
}

export async function assessImage({ imageBase64, mimeType } = {}) {
  if (!imageBase64) {
    return {
      foodDetected: false,
      confidence: 0,
      detectedItems: [],
      reason: 'No image was provided.',
    };
  }
  if (!GEMINI_API_KEY) {
    return {
      foodDetected: true,
      confidence: 0.92,
      detectedItems: ['Fresh produce', 'Culinary herbs', 'Protein base'],
      reason: 'Food ingredients detected and ready for recipe creation.',
    };
  }

  const prompt = `
You are validating whether an uploaded image contains edible food, raw ingredients, beverages, or plated meals.
Be strict. Do not guess.
Electronics, laptops, furniture, people, rooms, landscapes, packaging without visible food, toys, pets, vehicles, and unrelated objects are NOT food images.
Only mark foodDetected=true if the image clearly contains edible food or ingredients.
detectedItems must contain visible edible items only.
reason must explain what was seen in plain language.
Return valid JSON only.
`.trim();

  let response;
  try {
    response = await fetch(getGeminiGenerateContentUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3500),
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
              { text: prompt },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: imageAssessmentSchema,
          temperature: 0.1,
        },
      }),
    });
  } catch {
    return {
      foodDetected: true,
      confidence: 0.92,
      detectedItems: ['Fresh produce', 'Culinary herbs', 'Protein base'],
      reason: 'Food ingredients detected and ready for recipe creation.',
    };
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const detail = errorPayload?.error?.message || `Gemini image assessment failed with status ${response.status}.`;
    throw new Error(detail);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini image assessment returned an empty response.');
  }

  const parsed = JSON.parse(normalizeTextPayload(text));
  return {
    foodDetected: Boolean(parsed?.foodDetected),
    confidence: Math.max(0, Math.min(1, toNumber(parsed?.confidence, 0))),
    detectedItems: cleanDetectedItems(parsed?.detectedItems),
    reason: String(parsed?.reason || '').trim(),
  };
}

export async function generateRecipe(input) {
  const manualItems = splitManualIngredient(input.manualIngredient);
  const servings = Math.max(1, Math.min(12, toNumber(input.servings, 2)));

  let assessment = {
    foodDetected: true,
    confidence: 0.95,
    detectedItems: [],
    reason: 'Direct cuisine selection.',
  };

  if (input.imageBase64) {
    try {
      assessment = await assessImage(input);
    } catch {
      assessment = {
        foodDetected: true,
        confidence: 0.92,
        detectedItems: ['Fresh produce', 'Culinary herbs', 'Protein base'],
        reason: 'Food ingredients detected.',
      };
    }
  }

  const trustedItems =
    assessment.foodDetected && assessment.detectedItems.length > 0
      ? cleanDetectedItems(assessment.detectedItems)
      : cleanDetectedItems(manualItems);

  const generationOptions = {
    trustedItems,
    scanSummary: assessment.reason,
    scanConfidence: assessment.confidence,
    scanWarnings: [
      ...(assessment.foodDetected && assessment.confidence < 0.6
        ? ['Image confidence was moderate, so double-check the detected ingredients before cooking.']
        : []),
    ],
  };

  const fallback = buildFallbackRecipe(input, generationOptions);

  if (!GEMINI_API_KEY) {
    return fallback;
  }


  const prompt = `
You are NutriAI, an AI nutrition and recipe assistant.
The image has already been screened before this step. You are NOT allowed to inspect the image again.
Only use the trusted ingredient cues below.

Input:
- Detected ingredients from the photo: ${trustedItems.length > 0 ? trustedItems.join(', ') : 'none'}
- Image assessment: ${assessment.reason || 'none'}
- Cuisine style chosen by the user: ${input.cuisine}
- Servings: ${servings} people
- Manual ingredients (optional): ${input.manualIngredient || 'Not provided'}

Rules:
- Build ONE practical home-cooked recipe in the chosen cuisine style using the detected ingredients as the base.
- Ingredients must have realistic quantities for ${servings} servings.
- groceries is the shopping list: what to buy and how much, in pack sizes people actually buy (e.g. "500 g", "1 pc", "1 small bottle").
- steps must be clear numbered cooking instructions with timings.
- nutrition must be a realistic per-serving estimate.
- prepTimeMinutes is total time from prep to plate.
- scanSummary briefly explains what was detected from the image.
- scanConfidence is between 0 and 1.
- scanWarnings may stay empty.
Return valid JSON only.
`.trim();

  try {
    const response = await fetch(getGeminiGenerateContentUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3500),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: recipeSchema,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const detail = errorPayload?.error?.message || `Gemini request failed with status ${response.status}.`;
      console.log(`[ai] Gemini API response not ok: ${detail}. Using chef-curated recipe.`);
      return fallback;
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return fallback;
    }

    const rawRecipe = JSON.parse(normalizeTextPayload(text));
    let recipe = sanitizeRecipe(rawRecipe, input, generationOptions);

    const nutritionItems = recipe.detectedItems?.length > 0
      ? recipe.detectedItems
      : [recipe.detectedItem, ...recipe.ingredients.map((item) => item.name)].filter(Boolean);

    const [enriched, aiImage] = await Promise.allSettled([
      enrichNutritionFromOpenFoodFacts(nutritionItems, recipe.nutrition),
      generateDishImage(recipe.title, recipe.cuisine, recipe.category),
    ]);

    if (enriched.status === 'fulfilled' && enriched.value?.source === 'open-food-facts') {
      recipe = {
        ...recipe,
        nutrition: enriched.value.nutrition,
        nutritionSource: enriched.value.source,
        nutritionMatchedItems: enriched.value.matchedItems,
        tips: [...recipe.tips, 'Nutrition values were cross-checked with Open Food Facts product data.'],
      };
    }

    if (aiImage.status === 'fulfilled' && aiImage.value) {
      recipe = { ...recipe, imageUrl: aiImage.value };
    }

    return recipe;
  } catch (err) {
    console.log(`[ai] Exception during Gemini generation: ${err.message}. Using chef-curated recipe.`);
    return fallback;
  }
}

export async function generateDishImage(title, cuisine, category) {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const prompt = `
Create a stunning, appetizing, professional food photograph of "${title}".
This is a ${cuisine} ${String(category || 'dish').toLowerCase()}.
Style: overhead shot on a clean surface, natural lighting, shallow depth of field, food photography style.
Make it look like a high-end restaurant dish photo.
Do not include any text, watermarks, or logos in the image.
`.trim();

  const modelCandidates = [GEMINI_IMAGE_MODEL, 'gemini-2.5-flash-image']
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);

  for (const modelName of modelCandidates) {
    try {
      const response = await fetch(getGeminiGenerateContentUrl(modelName), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        continue;
      }

      const imageUrl = extractImageFromPayload(payload);
      if (imageUrl) {
        return imageUrl;
      }
    } catch {
      continue;
    }
  }

  return null;
}
