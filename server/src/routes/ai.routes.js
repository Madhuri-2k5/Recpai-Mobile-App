import { Router } from 'express';

import { requireAuth } from '../lib/auth.js';
import { assessImage, generateRecipe, UserFacingRecipeError } from '../lib/gemini.js';

const router = Router();

router.post('/detect', requireAuth, async (req, res) => {
  try {
    const assessment = await assessImage(req.body || {});
    return res.json({ assessment });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Image assessment failed.',
    });
  }
});

router.post('/recipe', requireAuth, async (req, res) => {
  try {
    const recipe = await generateRecipe(req.body || {});
    return res.json({ recipe });
  } catch (error) {
    const status = error instanceof UserFacingRecipeError ? 422 : 500;
    return res.status(status).json({
      message: error instanceof Error ? error.message : 'Recipe generation failed.',
    });
  }
});

export default router;
