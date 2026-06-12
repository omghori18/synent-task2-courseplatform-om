const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const protect = require('../middleware/protect');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const { sendEnrollmentEmail } = require('../utils/email');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check if already enrolled
    const user = await User.findById(req.user.id);
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_xxxxxxxxxxxxxxxxxx') {
      return res.status(400).json({ 
        message: 'Missing Razorpay Keys! Please add your real RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the backend/.env file.' 
      });
    }

    const options = {
      amount: Math.round(course.price * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${courseId.slice(-6)}_${Date.now()}`,
      notes: { courseId, userId: req.user.id },
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseName: course.title,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// POST /api/payment/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Get course for amount
    const course = await Course.findById(courseId);

    // Save payment data to MongoDB
    await Payment.create({
      user: req.user.id,
      course: courseId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: course ? course.price : 0,
      currency: 'INR',
      status: 'success',
    });

    // Enroll user
    const user = await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { enrolledCourses: courseId },
    }, { new: true });

    // Send enrollment email
    try {
      if (user && course) {
        await sendEnrollmentEmail(user.email, user.name, course.title);
      }
    } catch (emailErr) {
      console.error('Failed to send enrollment email:', emailErr.message);
    }

    res.json({ success: true, message: 'Payment verified and enrolled successfully' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error during payment verification' });
  }
});

// POST /api/enroll/:courseId — direct enrollment (for free courses or after verify)
router.post('/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { enrolledCourses: courseId },
    }, { new: true });

    // Send enrollment email
    try {
      if (user && course) {
        await sendEnrollmentEmail(user.email, user.name, course.title);
      }
    } catch (emailErr) {
      console.error('Failed to send enrollment email:', emailErr.message);
    }

    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
