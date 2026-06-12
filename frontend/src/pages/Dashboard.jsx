import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['all', 'Web Development', 'Backend', 'Database', 'Full Stack', 'Design', 'Data Science', 'Mobile', 'DevOps'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
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

  const fetchEnrolledCourses = async () => {
    try {
      const { data: me } = await api.get('/api/auth/me');
      setEnrolledCourses(me.enrolledCourses || []);
    } catch {
      // Not critical — user may simply have no enrollments
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'all' || c.category === category;
    return matchesSearch && matchesCat;
  });

  const inProgressCourses = enrolledCourses.filter((ec) => (ec.progressPercent || 0) < 100);
  const completedCourses = enrolledCourses.filter((ec) => (ec.progressPercent || 0) === 100);

  return (
    <div className="page-wrapper">
      <div className="container dashboard-page">
        {/* Header */}
        <div className="dashboard-header fade-in">
          <h1>
            {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Explore Courses'}
          </h1>
          <p className="text-muted mt-2">Discover expert-led courses to advance your career.</p>
        </div>

        {/* ── My Enrolled Courses (In Progress) ── */}
        {inProgressCourses.length > 0 && (
          <div className="fade-in" style={{ marginBottom: 40 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem' }}>My Enrolled Courses</h2>
              <span className="badge badge-accent">{inProgressCourses.length} in progress</span>
            </div>
            <div className="courses-grid">
              {inProgressCourses.map((ec) => (
                <div
                  key={ec._id}
                  className="course-card"
                  onClick={() => navigate(`/learn/${ec._id}`)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="course-thumbnail-placeholder" style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-teal) 100%)',
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#fff',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                  <div className="course-card-body" style={{ padding: 16 }}>
                    <h3 className="course-card-title" style={{ fontSize: '0.95rem', marginBottom: 8 }}>
                      {ec.title || 'Enrolled Course'}
                    </h3>
                    
                    {/* Progress indicator */}
                    <div style={{ marginBottom: 12 }}>
                      <div className="flex justify-between mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Progress</span>
                        <span className="mono font-semibold" style={{ color: 'var(--accent-teal)' }}>{ec.progressPercent || 0}%</span>
                      </div>
                      <div className="progress-bar-track" style={{ height: 4 }}>
                        <div className="progress-bar-fill" style={{ width: `${ec.progressPercent || 0}%` }} />
                      </div>
                    </div>

                    <button
                      className="btn btn-primary btn-sm btn-full"
                      onClick={(e) => { e.stopPropagation(); navigate(`/learn/${ec._id}`); }}
                    >
                      Continue Learning →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Completed Courses ── */}
        {completedCourses.length > 0 && (
          <div className="fade-in" style={{ marginBottom: 40 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '1.2rem' }}>Completed Courses</h2>
              <span className="badge badge-success">{completedCourses.length} completed</span>
            </div>
            <div className="courses-grid">
              {completedCourses.map((ec) => (
                <div
                  key={ec._id}
                  className="course-card"
                  onClick={() => navigate(`/learn/${ec._id}`)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="course-thumbnail-placeholder" style={{
                    background: 'linear-gradient(135deg, var(--success) 0%, #15803d 100%)',
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#fff',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div className="course-card-body" style={{ padding: 16 }}>
                    <h3 className="course-card-title" style={{ fontSize: '0.95rem', marginBottom: 8 }}>
                      {ec.title || 'Completed Course'}
                    </h3>

                    {/* Progress Indicator */}
                    <div style={{ marginBottom: 12 }}>
                      <div className="flex justify-between mb-1" style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                        <span className="font-semibold">✓ Completed</span>
                        <span className="mono font-semibold">100%</span>
                      </div>
                      <div className="progress-bar-track" style={{ height: 4 }}>
                        <div className="progress-bar-fill" style={{ width: '100%', background: 'var(--success)' }} />
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary btn-sm btn-full"
                      onClick={(e) => { e.stopPropagation(); navigate(`/learn/${ec._id}`); }}
                    >
                      Review Course →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── All Courses ── */}
        <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }} className="fade-in">All Courses</h2>

        {/* Search & Filter */}
        <div className="search-filter-bar fade-in">
          <div className="search-input-wrap">
            <span className="search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
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
              <div className="empty-state-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <h3>No courses found</h3>
              <p className="mt-2">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
