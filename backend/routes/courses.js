const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET /api/courses — all courses (public)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category && category !== 'all') query.category = category;

    const courses = await Course.find(query).select('-modules').sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/:id — single course with full modules (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
