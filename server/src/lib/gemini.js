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

function buildFallbackRecipe(input, options = {}) {
  const trustedItems = cleanDetectedItems(options.trustedItems);
  const manualItems = splitManualIngredient(input.manualIngredient);
  const detectedItems = trustedItems.length > 0 ? trustedItems : manualItems.length > 0 ? manualItems : ['Mixed vegetables'];
  const primaryItem = detectedItems[0];
  const servings = Math.max(1, Math.min(12, toNumber(input.servings, 2)));

  return {
    detectedItem: primaryItem,
    detectedItems,
    title: `${input.cuisine} ${primaryItem} Bowl`,
    category: 'Bowl',
    cuisine: input.cuisine,
    dietGoal: 'Balanced',
    prepTimeMinutes: 25,
    difficulty: 'Medium',
    servings,
    summary: `A simple ${input.cuisine.toLowerCase()} bowl built from the detected ingredients.`,
    ingredients: detectedItems.slice(0, 5).map((item, index) => ({
      name: item,
      quantity: index === 0 ? `${servings} cups` : '1/2 cup',
    })),
    groceries: detectedItems.slice(0, 5).map((item, index) => ({
      name: item,
      quantity: index === 0 ? '1 pack' : '1 pc',
    })),
    steps: [
      `Prepare the ${detectedItems.map((item) => item.toLowerCase()).join(', ')} and keep the cuts small for faster cooking.`,
      `Season with ${input.cuisine.toLowerCase()} spices and cook on medium heat until done.`,
      'Plate everything together and serve warm.',
    ],
    tips: [
      'Use minimal oil to keep calories lower.',
      'Add yogurt, paneer, tofu, or eggs for extra protein.',
    ],
    nutrition: { calories: 420, protein: 24, carbs: 45, fat: 14, fiber: 6 },
    scanSummary: options.scanSummary || 'Recipe built from the available ingredient cues.',
    scanConfidence: toNumber(options.scanConfidence, trustedItems.length > 0 ? 0.6 : 0),
    scanWarnings: Array.isArray(options.scanWarnings) ? options.scanWarnings : [],
    nutritionSource: 'gemini',
    nutritionMatchedItems: [],
    imageUrl: '',
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
      foodDetected: false,
      confidence: 0,
      detectedItems: [],
      reason: 'Image assessment is unavailable on the server.',
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

  const response = await fetch(getGeminiGenerateContentUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  const assessment = GEMINI_API_KEY
    ? await assessImage(input)
    : { foodDetected: false, confidence: 0, detectedItems: [], reason: 'Image assessment is unavailable.' };

  const trustedItems =
    assessment.foodDetected && assessment.detectedItems.length > 0
      ? cleanDetectedItems(assessment.detectedItems)
      : cleanDetectedItems(manualItems);

  if (!assessment.foodDetected && manualItems.length === 0) {
    throw new UserFacingRecipeError(assessment.reason || 'No food items were detected. Try a clearer photo.');
  }
  if (assessment.foodDetected && assessment.confidence < 0.45 && manualItems.length === 0) {
    throw new UserFacingRecipeError('Could not confidently identify food from that image. Please retake the photo.');
  }

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

  const response = await fetch(getGeminiGenerateContentUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    throw new Error(detail);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
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
