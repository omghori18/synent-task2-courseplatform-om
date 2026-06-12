const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
  razorpaySignature: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  createdAt: { type: Date, default: Date.now },
});

paymentSchema.index({ user: 1, course: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
