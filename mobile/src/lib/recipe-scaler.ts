export function scaleQuantity(qtyStr: string, factor: number): string {
  if (!qtyStr || factor === 1) return qtyStr;

  const trimmed = qtyStr.trim();

  // Handle mixed fractions like "1 1/2 cups"
  const mixedFractionMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)(.*)$/);
  if (mixedFractionMatch) {
    const whole = parseFloat(mixedFractionMatch[1]);
    const num = parseFloat(mixedFractionMatch[2]);
    const den = parseFloat(mixedFractionMatch[3]);
    const val = (whole + num / den) * factor;
    const rest = mixedFractionMatch[4];
    return `${formatScaledNumber(val)}${rest}`;
  }

  // Handle simple fractions like "1/2 tsp"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)(.*)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    const val = (num / den) * factor;
    const rest = fractionMatch[3];
    return `${formatScaledNumber(val)}${rest}`;
  }

  // Handle standard decimal or integers like "200g", "1.5 tbsp", "4 cloves"
  const numberMatch = trimmed.match(/^([\d.]+)(.*)$/);
  if (numberMatch) {
    const num = parseFloat(numberMatch[1]);
    if (!isNaN(num)) {
      const val = num * factor;
      const rest = numberMatch[2];
      return `${formatScaledNumber(val)}${rest}`;
    }
  }

  return qtyStr;
}

function formatScaledNumber(num: number): string {
  if (Number.isInteger(num)) return String(num);
  const rounded = Math.round(num * 10) / 10;
  if (Number.isInteger(rounded)) return String(rounded);

  const whole = Math.floor(rounded);
  const dec = rounded - whole;

  if (Math.abs(dec - 0.5) < 0.05) {
    return whole === 0 ? '1/2' : `${whole} 1/2`;
  }
  if (Math.abs(dec - 0.25) < 0.05) {
    return whole === 0 ? '1/4' : `${whole} 1/4`;
  }
  if (Math.abs(dec - 0.75) < 0.05) {
    return whole === 0 ? '3/4' : `${whole} 3/4`;
  }

  return rounded.toFixed(1).replace(/\.0$/, '');
}

export function scaleNutrition(
  nutrition: { calories: number; protein: number; carbs: number; fat: number },
  factor: number
) {
  return {
    calories: Math.round(nutrition.calories * factor),
    protein: Math.round(nutrition.protein * factor),
    carbs: Math.round(nutrition.carbs * factor),
    fat: Math.round(nutrition.fat * factor),
  };
}
