import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const EMPTY_COURSE = {
  title: '',
  description: '',
  price: '',
  thumbnail: '',
  instructor: '',
  category: 'Web Development',
  modules: [],
};

const EMPTY_LESSON = { title: '', videoUrl: '', duration: '5:00' };

const CATEGORIES = ['Web Development', 'Backend', 'Database', 'Full Stack', 'Design', 'Data Science', 'Mobile', 'DevOps'];

// ── Module/Lesson Editor Component ──
function ModuleEditor({ modules, onChange }) {
  const addModule = () => {
    onChange([...modules, { title: '', lessons: [] }]);
  };

  const removeModule = (mi) => {
    onChange(modules.filter((_, i) => i !== mi));
  };

  const updateModuleTitle = (mi, title) => {
    const updated = [...modules];
    updated[mi] = { ...updated[mi], title };
    onChange(updated);
  };

  const addLesson = (mi) => {
    const updated = [...modules];
    updated[mi] = {
      ...updated[mi],
      lessons: [...updated[mi].lessons, { ...EMPTY_LESSON }],
    };
    onChange(updated);
  };

  const removeLesson = (mi, li) => {
    const updated = [...modules];
    updated[mi] = {
      ...updated[mi],
      lessons: updated[mi].lessons.filter((_, i) => i !== li),
    };
    onChange(updated);
  };

  const updateLesson = (mi, li, field, value) => {
    const updated = [...modules];
    const lessons = [...updated[mi].lessons];
    lessons[li] = { ...lessons[li], [field]: value };
    updated[mi] = { ...updated[mi], lessons };
    onChange(updated);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div className="flex items-center justify-between mb-3">
        <label className="form-label" style={{ margin: 0 }}>Modules & Lessons</label>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={addModule}
          id="add-module-btn"
        >
          + Add Module
        </button>
      </div>

      {modules.length === 0 && (
        <p className="text-sm text-muted" style={{ padding: '16px 0', textAlign: 'center' }}>
          No modules yet. Click "Add Module" to get started.
        </p>
      )}

      {modules.map((mod, mi) => (
        <div
          key={mi}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 12,
            overflow: 'hidden',
          }}
        >
          {/* Module Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'var(--sidebar-bg)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span className="text-xs font-bold text-muted" style={{ flexShrink: 0 }}>
              M{mi + 1}
            </span>
            <input
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '0.85rem', flex: 1 }}
              placeholder="Module title..."
              value={mod.title}
              onChange={(e) => updateModuleTitle(mi, e.target.value)}
            />
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => removeModule(mi)}
            >
              Remove
            </button>
          </div>

          {/* Lessons */}
          <div style={{ padding: '10px 14px' }}>
            {mod.lessons.map((lesson, li) => (
              <div
                key={li}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 80px auto',
                  gap: 8,
                  marginBottom: 8,
                  alignItems: 'center',
                }}
              >
                <input
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  placeholder="Lesson title"
                  value={lesson.title}
                  onChange={(e) => updateLesson(mi, li, 'title', e.target.value)}
                />
                <input
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  placeholder="YouTube URL"
                  value={lesson.videoUrl}
                  onChange={(e) => updateLesson(mi, li, 'videoUrl', e.target.value)}
                />
                <input
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  placeholder="5:00"
                  value={lesson.duration}
                  onChange={(e) => updateLesson(mi, li, 'duration', e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '4px 8px', color: 'var(--error)', fontSize: '0.85rem' }}
                  onClick={() => removeLesson(mi, li)}
                  title="Remove lesson"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.8rem', color: 'var(--accent)' }}
              onClick={() => addLesson(mi)}
            >
              + Add Lesson
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Course Modal ──
function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState(course || EMPTY_COURSE);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleModulesChange = (modules) => {
    setForm((p) => ({ ...p, modules }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (course?._id) {
        const { data } = await api.put(`/api/admin/courses/${course._id}`, form);
        onSave(data, 'edit');
      } else {
        const { data } = await api.post('/api/admin/courses', form);
        onSave(data, 'add');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h3>{course?._id ? 'Edit Course' : 'Add New Course'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} id="modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit} id="course-form">
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} required placeholder="Course Title" />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Course description..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input className="form-input" name="price" type="number" min="0" value={form.price} onChange={handleChange} required placeholder="1999" />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Instructor *</label>
              <input className="form-input" name="instructor" value={form.instructor} onChange={handleChange} required placeholder="Instructor Name" />
            </div>
            <div className="form-group">
              <label className="form-label">Thumbnail URL</label>
              <input className="form-input" name="thumbnail" value={form.thumbnail} onChange={handleChange} placeholder="https://..." type="url" />
            </div>

            {/* Module / Lesson Editor */}
            <ModuleEditor modules={form.modules || []} onChange={handleModulesChange} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} id="save-course-btn">
              {saving ? <span className="spinner" /> : (course?._id ? 'Save Changes' : 'Add Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | course object
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, uRes, eRes] = await Promise.all([
        api.get('/api/courses'),
        api.get('/api/admin/users'),
        api.get('/api/admin/enrollments'),
      ]);
      setCourses(cRes.data);
      setUsers(uRes.data);
      setEnrollments(eRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (course, action) => {
    if (action === 'add') {
      setCourses((p) => [course, ...p]);
      toast.success('Course added successfully!');
    } else {
      setCourses((p) => p.map((c) => (c._id === course._id ? course : c)));
      toast.success('Course updated successfully!');
    }
    setModal(null);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
    setDeleting(courseId);
    try {
      await api.delete(`/api/admin/courses/${courseId}`);
      setCourses((p) => p.filter((c) => c._id !== courseId));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container admin-page fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>Admin Panel</h1>
            <p className="text-muted mt-2">Manage your platform content and users</p>
          </div>
          {tab === 'courses' && (
            <button className="btn btn-primary" onClick={() => setModal('add')} id="add-course-btn">
              + Add Course
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Registered Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{enrollments.length}</div>
            <div className="stat-label">Total Enrollments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ₹{enrollments.reduce((s, e) => s + (e.coursePrice || 0), 0).toLocaleString('en-IN')}
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {['courses', 'users', 'enrollments'].map((t) => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              id={`tab-${t}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'courses' && ` (${courses.length})`}
              {t === 'users' && ` (${users.length})`}
              {t === 'enrollments' && ` (${enrollments.length})`}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        )}

        {/* Courses Table */}
        {!loading && tab === 'courses' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Instructor</th>
                  <th>Modules</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No courses yet</td></tr>
                ) : courses.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600, maxWidth: 280 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.title}
                      </span>
                    </td>
                    <td><span className="badge badge-accent">{c.category}</span></td>
                    <td>{c.instructor}</td>
                    <td className="text-muted text-sm">{c.modules?.length || 0} modules</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>
                      {c.price === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `₹${c.price.toLocaleString('en-IN')}`}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setModal(c)}
                          id={`edit-${c._id}`}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(c._id)}
                          disabled={deleting === c._id}
                          id={`delete-${c._id}`}
                        >
                          {deleting === c._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Table */}
        {!loading && tab === 'users' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Enrolled</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No users yet</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-default'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.enrolledCourses?.length || 0} courses</td>
                    <td className="text-muted text-sm">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Enrollments Table */}
        {!loading && tab === 'enrollments' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No enrollments yet</td></tr>
                ) : enrollments.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{e.userName}</td>
                    <td className="text-muted">{e.userEmail}</td>
                    <td>{e.courseName}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>
                      {e.coursePrice === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `₹${e.coursePrice?.toLocaleString('en-IN')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <CourseModal
          course={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
