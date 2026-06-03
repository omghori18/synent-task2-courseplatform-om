require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Course = require('./models/Course');
const User = require('./models/User');

const courses = [
  {
    title: 'Complete React Developer Bootcamp 2024',
    description:
      'Master React from scratch. Learn hooks, context, Redux, React Router, and build real-world projects. Go from zero to a confident React developer with hands-on practice.',
    price: 1999,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    instructor: 'Alex Johnson',
    category: 'Web Development',
    modules: [
      {
        title: 'Getting Started with React',
        lessons: [
          { title: 'Introduction to React', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '12:30' },
          { title: 'JSX Deep Dive', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '15:45' },
          { title: 'Components and Props', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '18:20' },
        ],
      },
      {
        title: 'React Hooks Mastery',
        lessons: [
          { title: 'useState Hook', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '20:10' },
          { title: 'useEffect Hook', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '22:55' },
          { title: 'Custom Hooks', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '25:00' },
        ],
      },
      {
        title: 'State Management',
        lessons: [
          { title: 'Context API', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '19:30' },
          { title: 'Redux Toolkit', videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '35:00' },
        ],
      },
    ],
  },
  {
    title: 'Node.js & Express Masterclass',
    description:
      'Build scalable backend APIs with Node.js and Express. Covers REST APIs, authentication, MongoDB integration, middleware, and deployment on cloud platforms.',
    price: 2499,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
    instructor: 'Maria Santos',
    category: 'Backend',
    modules: [
      {
        title: 'Node.js Fundamentals',
        lessons: [
          { title: 'Node.js Overview', videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE', duration: '10:00' },
          { title: 'Modules and NPM', videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE', duration: '14:30' },
          { title: 'File System & Streams', videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE', duration: '16:00' },
        ],
      },
      {
        title: 'Express Framework',
        lessons: [
          { title: 'Setting up Express', videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE', duration: '11:00' },
          { title: 'Routing & Middleware', videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE', duration: '20:00' },
          { title: 'Error Handling', videoUrl: 'https://www.youtube.com/embed/Oe421EPjeBE', duration: '13:45' },
        ],
      },
    ],
  },
  {
    title: 'MongoDB — The Complete Developer Guide',
    description:
      'Learn MongoDB from the ground up. Master CRUD operations, aggregation pipelines, indexing, schema design with Mongoose, and integrate with Node.js applications.',
    price: 1799,
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80',
    instructor: 'David Chen',
    category: 'Database',
    modules: [
      {
        title: 'MongoDB Basics',
        lessons: [
          { title: 'What is MongoDB?', videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A', duration: '8:30' },
          { title: 'CRUD Operations', videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A', duration: '22:00' },
          { title: 'Query Operators', videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A', duration: '18:15' },
        ],
      },
      {
        title: 'Mongoose ODM',
        lessons: [
          { title: 'Schema Design', videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A', duration: '20:00' },
          { title: 'Relationships & Refs', videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A', duration: '24:30' },
          { title: 'Aggregation Pipeline', videoUrl: 'https://www.youtube.com/embed/ExcRbA7fy_A', duration: '30:00' },
        ],
      },
    ],
  },
  {
    title: 'Full-Stack JavaScript — MERN Stack',
    description:
      'Build complete web applications using MongoDB, Express, React, and Node.js. From frontend to backend, learn to create production-ready full-stack apps.',
    price: 3499,
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80',
    instructor: 'Priya Sharma',
    category: 'Full Stack',
    modules: [
      {
        title: 'Project Setup & Architecture',
        lessons: [
          { title: 'MERN Stack Overview', videoUrl: 'https://www.youtube.com/embed/mrHNSanmqQ4', duration: '12:00' },
          { title: 'Project Structure', videoUrl: 'https://www.youtube.com/embed/mrHNSanmqQ4', duration: '10:30' },
        ],
      },
      {
        title: 'Building the Backend',
        lessons: [
          { title: 'REST API Design', videoUrl: 'https://www.youtube.com/embed/mrHNSanmqQ4', duration: '25:00' },
          { title: 'JWT Authentication', videoUrl: 'https://www.youtube.com/embed/mrHNSanmqQ4', duration: '28:00' },
          { title: 'File Uploads', videoUrl: 'https://www.youtube.com/embed/mrHNSanmqQ4', duration: '15:00' },
        ],
      },
      {
        title: 'Building the Frontend',
        lessons: [
          { title: 'React + Axios Integration', videoUrl: 'https://www.youtube.com/embed/mrHNSanmqQ4', duration: '22:00' },
          { title: 'Protected Routes', videoUrl: 'https://www.youtube.com/embed/mrHNSanmqQ4', duration: '16:00' },
          { title: 'Deploying to Production', videoUrl: 'https://www.youtube.com/embed/mrHNSanmqQ4', duration: '20:00' },
        ],
      },
    ],
  },
  {
    title: 'UI/UX Design Fundamentals',
    description:
      'Learn design thinking, wireframing, prototyping, and building beautiful user interfaces. Master Figma and apply real-world design principles to your projects.',
    price: 1499,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    instructor: 'Sophie Laurent',
    category: 'Design',
    modules: [
      {
        title: 'Design Fundamentals',
        lessons: [
          { title: 'Color Theory', videoUrl: 'https://www.youtube.com/embed/AvgCkHrcj8w', duration: '14:00' },
          { title: 'Typography', videoUrl: 'https://www.youtube.com/embed/AvgCkHrcj8w', duration: '12:30' },
          { title: 'Grid Systems', videoUrl: 'https://www.youtube.com/embed/AvgCkHrcj8w', duration: '11:00' },
        ],
      },
      {
        title: 'Figma Mastery',
        lessons: [
          { title: 'Figma Interface Tour', videoUrl: 'https://www.youtube.com/embed/AvgCkHrcj8w', duration: '18:00' },
          { title: 'Components & Variants', videoUrl: 'https://www.youtube.com/embed/AvgCkHrcj8w', duration: '22:00' },
          { title: 'Prototyping', videoUrl: 'https://www.youtube.com/embed/AvgCkHrcj8w', duration: '20:00' },
        ],
      },
    ],
  },
  {
    title: 'Python for Data Science & ML',
    description:
      'Start your data science journey with Python. Learn Pandas, NumPy, Matplotlib, and intro to machine learning with scikit-learn through practical projects.',
    price: 2999,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    instructor: 'James Wilson',
    category: 'Data Science',
    modules: [
      {
        title: 'Python Foundations',
        lessons: [
          { title: 'Python Basics', videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc', duration: '20:00' },
          { title: 'Data Structures', videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc', duration: '18:00' },
          { title: 'Functions & OOP', videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc', duration: '25:00' },
        ],
      },
      {
        title: 'Data Analysis',
        lessons: [
          { title: 'NumPy Arrays', videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc', duration: '20:00' },
          { title: 'Pandas DataFrames', videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc', duration: '28:00' },
          { title: 'Matplotlib Visualization', videoUrl: 'https://www.youtube.com/embed/_uQrJ0TkZlc', duration: '22:00' },
        ],
      },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Course.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing courses and users');

    // Seed courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`📚 Seeded ${createdCourses.length} courses`);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@courseplatform.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log(`👤 Admin created: ${admin.email} / password: admin123`);

    // Create sample student
    const studentPassword = await bcrypt.hash('student123', 12);
    const student = await User.create({
      name: 'John Doe',
      email: 'student@courseplatform.com',
      password: studentPassword,
      role: 'user',
      enrolledCourses: [createdCourses[0]._id],
    });
    console.log(`👤 Student created: ${student.email} / password: student123`);

    console.log('\n✅ Seed complete!');
    console.log('Admin:   admin@courseplatform.com / admin123');
    console.log('Student: student@courseplatform.com / student123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
