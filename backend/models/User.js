const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isVerified: { type: Boolean, default: false },
  verifyToken: { type: String },
  verifyTokenExpiry: { type: Date },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
