import type { Recipe } from '@/lib/api';

/**
 * In-memory hand-off between the scan flow screens.
 * Base64 photos and generated recipes are too large for route params.
 */
export const scanFlow: {
  imageBase64: string | null;
  imageUri: string | null;
  detectedItems: string[];
  detectedReason: string;
  detectedConfidence: number;
  recipe: Recipe | null;
} = {
  imageBase64: null,
  imageUri: null,
  detectedItems: [],
  detectedReason: '',
  detectedConfidence: 0,
  recipe: null,
};

export function resetScanFlow() {
  scanFlow.imageBase64 = null;
  scanFlow.imageUri = null;
  scanFlow.detectedItems = [];
  scanFlow.detectedReason = '';
  scanFlow.detectedConfidence = 0;
  scanFlow.recipe = null;
}
