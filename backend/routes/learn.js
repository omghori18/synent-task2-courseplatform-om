const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');

// GET /api/learn/:courseId — get course content (must be enrolled)
router.get('/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;

    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledCourses.some(
      (id) => id.toString() === courseId
    );
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const progress = await Progress.findOne({ user: req.user.id, course: courseId });

    res.json({ course, progress: progress || { completedLessons: [], progressPercent: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/learn/complete — mark a lesson as complete
router.post('/complete', protect, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Count total lessons
    const totalLessons = course.modules.reduce(
      (sum, mod) => sum + mod.lessons.length, 0
    );

    let progress = await Progress.findOne({ user: req.user.id, course: courseId });
    if (!progress) {
      progress = new Progress({ user: req.user.id, course: courseId, completedLessons: [] });
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    progress.progressPercent =
      totalLessons > 0
        ? Math.round((progress.completedLessons.length / totalLessons) * 100)
        : 0;
    progress.updatedAt = new Date();
    await progress.save();

    res.json({
      completedLessons: progress.completedLessons,
      progressPercent: progress.progressPercent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/learn/progress/:courseId — get progress
router.get('/progress/:courseId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });
    if (!progress) return res.json({ completedLessons: [], progressPercent: 0 });
    res.json({ completedLessons: progress.completedLessons, progressPercent: progress.progressPercent });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
