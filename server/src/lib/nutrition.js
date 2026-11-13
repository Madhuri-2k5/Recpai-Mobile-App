const OPEN_FOOD_FACTS_BASE_URL = 'https://world.openfoodfacts.org';
const USER_AGENT = 'NutriAI/2.0 (recpai@example.com)';

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function summarizeNutrients(product) {
  const nutriments = product?.nutriments || {};

  return {
    calories: Math.round(toNumber(nutriments['energy-kcal_100g']) || toNumber(nutriments['energy-kcal'])),
    protein: Math.round(toNumber(nutriments.proteins_100g) || toNumber(nutriments.proteins)),
    carbs: Math.round(toNumber(nutriments.carbohydrates_100g) || toNumber(nutriments.carbohydrates)),
    fat: Math.round(toNumber(nutriments.fat_100g) || toNumber(nutriments.fat)),
    fiber: Math.round(toNumber(nutriments.fiber_100g) || toNumber(nutriments.fiber)),
  };
}

async function searchProduct(term) {
  const url =
    `${OPEN_FOOD_FACTS_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(term)}` +
    '&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments';

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const product = payload?.products?.find((item) => {
    const nutrients = summarizeNutrients(item);
    return Object.values(nutrients).some((value) => value > 0);
  });

  return product ? { term, nutrients: summarizeNutrients(product) } : null;
}

export async function enrichNutritionFromOpenFoodFacts(items, currentNutrition) {
  const uniqueItems = [...new Set((items || []).map((item) => String(item).trim()).filter(Boolean))].slice(0, 3);

  if (uniqueItems.length === 0) {
    return { nutrition: currentNutrition, source: 'gemini', matchedItems: [] };
  }

  const results = await Promise.allSettled(uniqueItems.map((item) => searchProduct(item)));
  const successful = results
    .filter((result) => result.status === 'fulfilled' && result.value)
    .map((result) => result.value);

  if (successful.length === 0) {
    return { nutrition: currentNutrition, source: 'gemini', matchedItems: [] };
  }

  const totals = successful.reduce(
    (acc, item) => ({
      calories: acc.calories + item.nutrients.calories,
      protein: acc.protein + item.nutrients.protein,
      carbs: acc.carbs + item.nutrients.carbs,
      fat: acc.fat + item.nutrients.fat,
      fiber: acc.fiber + item.nutrients.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const count = successful.length;
  return {
    nutrition: {
      calories: Math.max(currentNutrition.calories, Math.round(totals.calories / count)),
      protein: Math.max(currentNutrition.protein, Math.round(totals.protein / count)),
      carbs: Math.max(currentNutrition.carbs, Math.round(totals.carbs / count)),
      fat: Math.max(currentNutrition.fat, Math.round(totals.fat / count)),
      fiber: Math.max(currentNutrition.fiber, Math.round(totals.fiber / count)),
    },
    source: 'open-food-facts',
    matchedItems: successful.map((item) => item.term),
  };
}
