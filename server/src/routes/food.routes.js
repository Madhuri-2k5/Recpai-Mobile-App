import { Router } from 'express';
import Food from '../models/Food.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 }).limit(50);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat } = req.body;
    if (!name || calories == null) {
      return res.status(400).json({ message: 'name and calories are required' });
    }
    const food = await Food.create({ name, calories, protein, carbs, fat });
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
