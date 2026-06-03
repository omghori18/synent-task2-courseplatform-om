const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');

// Apply both middlewares to all admin routes
router.use(protect, adminOnly);

// POST /api/admin/courses — create course
router.post('/courses', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/admin/courses/:id — update course
router.put('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/admin/courses/:id — delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Remove from all users' enrolledCourses
    await User.updateMany(
      { enrolledCourses: req.params.id },
      { $pull: { enrolledCourses: req.params.id } }
    );

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users — all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('enrolledCourses', 'title')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/enrollments — all enrollments
router.get('/enrollments', async (req, res) => {
  try {
    const users = await User.find({ enrolledCourses: { $exists: true, $not: { $size: 0 } } })
      .select('name email enrolledCourses createdAt')
      .populate('enrolledCourses', 'title price');

    const enrollments = [];
    users.forEach((user) => {
      user.enrolledCourses.forEach((course) => {
        enrollments.push({
          userName: user.name,
          userEmail: user.email,
          courseName: course.title,
          coursePrice: course.price,
          enrolledAt: user.createdAt,
        });
      });
    });

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
