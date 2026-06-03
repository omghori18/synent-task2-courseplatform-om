import { useState, useEffect } from 'react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['all', 'Web Development', 'Backend', 'Database', 'Full Stack', 'Design', 'Data Science', 'Mobile', 'DevOps'];

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'all' || c.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="page-wrapper">
      <div className="container dashboard-page">
        {/* Header */}
        <div className="dashboard-header fade-in">
          <h1>
            {user?.name ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Explore Courses'}
          </h1>
          <p className="text-muted mt-2">Discover expert-led courses to advance your career.</p>
        </div>

        {/* Search & Filter */}
        <div className="search-filter-bar fade-in">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input search-input"
              id="course-search"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ minWidth: 180 }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted mb-4">
            Showing <strong>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}
            {category !== 'all' ? ` in ${category}` : ''}
            {search ? ` matching "${search}"` : ''}
          </p>
        )}

        {/* Course Grid */}
        <div className="courses-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="course-card" style={{ cursor: 'default' }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div className="course-card-body" style={{ gap: 12 }}>
                  <div className="skeleton" style={{ height: 16, width: '40%' }} />
                  <div className="skeleton" style={{ height: 20, width: '85%' }} />
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((course) => <CourseCard key={course._id} course={course} />)
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No courses found</h3>
              <p className="mt-2">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
