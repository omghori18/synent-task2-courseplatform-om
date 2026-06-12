import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS = {
  'Web Development': '🌐', 'Backend': '⚙️', 'Database': '🗄️',
  'Full Stack': '🚀', 'Design': '🎨', 'Data Science': '📊',
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/courses/${id}`);
      setCourse(data);
      // Check enrollment status via /api/auth/me
      if (isAuthenticated) {
        try {
          const { data: me } = await api.get('/api/auth/me');
          const enrolled = me.enrolledCourses?.some(
            (c) => (c._id || c) === id
          );
          setIsEnrolled(enrolled);
        } catch {}
      }
    } catch {
      toast.error('Failed to load course');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (idx) => {
    setOpenModules((p) => ({ ...p, [idx]: !p[idx] }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to enroll');
      navigate('/login');
      return;
    }

    if (course.price === 0) {
      // Free course — direct enroll
      setEnrolling(true);
      try {
        await api.post(`/api/enroll/${id}`);
        toast.success('Enrolled successfully! Start learning now.');
        toast.info(`Enrollment confirmation sent to ${user?.email}`, { autoClose: 5000 });
        setIsEnrolled(true);
        navigate(`/learn/${id}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Enrollment failed');
      } finally {
        setEnrolling(false);
      }
      return;
    }

    // Paid course — Razorpay
    setEnrolling(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway. Please try again.');
      setEnrolling(false);
      return;
    }

    try {
      const { data: orderData } = await api.post('/api/payment/create-order', { courseId: id });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LearnSphere',
        description: orderData.courseName,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: id,
            });
            toast.success('Payment successful! You are now enrolled.');
            toast.info(`Enrollment confirmation sent to ${user?.email}`, { autoClose: 5000 });
            setIsEnrolled(true);
            navigate(`/learn/${id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#1D2B4F' },
        modal: { ondismiss: () => setEnrolling(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="container course-detail">
        <div className="skeleton" style={{ height: 340, borderRadius: 'var(--radius-lg)', marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: '40%' }} />
      </div>
    </div>
  );

  if (!course) return null;

  const totalLessons = course.modules?.reduce((sum, m) => sum + m.lessons.length, 0) || 0;
  const icon = CATEGORY_ICONS[course.category] || '📚';

  return (
    <div className="page-wrapper">
      <div className="container course-detail fade-in">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}>Courses</Link>
          {' / '}
          <span style={{ color: 'var(--text-primary)' }}>{course.title}</span>
        </nav>

        <div className="course-detail-grid">
          {/* Left column */}
          <div>
            {/* Hero */}
            <div className="course-detail-hero">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} />
              ) : (
                <div className="course-detail-hero-placeholder">{icon}</div>
              )}
            </div>

            {/* Info */}
            <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-accent">{course.category}</span>
              <span className="badge badge-default">{course.modules?.length || 0} modules</span>
              <span className="badge badge-default">{totalLessons} lessons</span>
            </div>
            <h1 className="mb-2" style={{ letterSpacing: '-0.03em' }}>{course.title}</h1>
            <p className="text-muted mb-4" style={{ fontSize: '1rem' }}>{course.description}</p>
            <p className="text-sm text-muted mb-6">
              <strong style={{ color: 'var(--text-primary)' }}>Instructor:</strong> {course.instructor}
            </p>

            {/* Module List */}
            <h2 className="mb-3" style={{ fontSize: '1.2rem' }}>Course Content</h2>
            <div className="module-list">
              {course.modules?.map((mod, mi) => (
                <div key={mi} className="module-item">
                  <div
                    className="module-header"
                    onClick={() => toggleModule(mi)}
                    id={`module-${mi}`}
                    role="button"
                  >
                    <h4>
                      <span style={{ color: 'var(--text-muted)', marginRight: 8, fontWeight: 400 }}>
                        {String(mi + 1).padStart(2, '0')}
                      </span>
                      {mod.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {mod.lessons.length} lessons {openModules[mi] ? '▲' : '▼'}
                    </span>
                  </div>
                  {openModules[mi] && (
                    <div className="module-lessons">
                      {mod.lessons.map((lesson, li) => (
                        <div key={li} className="lesson-preview-item">
                          <span className="lesson-icon">▶</span>
                          <span style={{ flex: 1 }}>{lesson.title}</span>
                          <span className="mono text-xs">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Enrollment Card */}
          <div>
            <div className="enroll-card">
              <div className="enroll-price">
                {course.price === 0 ? (
                  <span style={{ color: 'var(--success)' }}>Free</span>
                ) : (
                  <>₹{course.price.toLocaleString('en-IN')}</>
                )}
              </div>

              {isEnrolled ? (
                <>
                  <div className="alert alert-success mb-4">✅ You're enrolled in this course</div>
                  <button
                    className="btn btn-success btn-full btn-lg"
                    onClick={() => navigate(`/learn/${id}`)}
                    id="continue-learning-btn"
                  >
                    Continue Learning →
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  id="enroll-btn"
                >
                  {enrolling ? <><span className="spinner" /> Processing...</> : 'Enroll Now'}
                </button>
              )}

              <ul className="enroll-features" style={{ marginTop: 20 }}>
                <li><span>✓</span> Full lifetime access</li>
                <li><span>✓</span> {totalLessons} lessons across {course.modules?.length} modules</li>
                <li><span>✓</span> Certificate of completion</li>
                <li><span>✓</span> Mobile & desktop access</li>
                {course.price === 0 && <li><span>✓</span> Completely free — no credit card needed</li>}
              </ul>

              {course.price > 0 && !isEnrolled && (
                <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 12 }}>
                  🔒 Secure payment via Razorpay (Test Mode)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
