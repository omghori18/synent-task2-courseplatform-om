import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS = {
  'Web Development': '🌐',
  'Backend': '⚙️',
  'Database': '🗄️',
  'Full Stack': '🚀',
  'Design': '🎨',
  'Data Science': '📊',
  'Mobile': '📱',
  'DevOps': '🔧',
};

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const icon = CATEGORY_ICONS[course.category] || '📚';
  const totalLessons = course.modules
    ? course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
    : 0;

  return (
    <div
      className="course-card"
      onClick={() => navigate(`/course/${course._id}`)}
      role="button"
      tabIndex={0}
      id={`course-card-${course._id}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/course/${course._id}`)}
    >
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="course-thumbnail"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="course-thumbnail-placeholder">{icon}</div>
      )}

      <div className="course-card-body">
        <div className="course-card-meta">
          <span className="badge badge-accent">{course.category}</span>
          {totalLessons > 0 && (
            <span className="text-xs text-muted">{totalLessons} lessons</span>
          )}
        </div>
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-instructor">by {course.instructor}</p>
        {course.description && (
          <p className="text-sm text-muted" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
          }}>
            {course.description}
          </p>
        )}
      </div>

      <div className="course-card-footer">
        <span className={`course-price ${course.price === 0 ? 'course-price-free' : ''}`}>
          {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={(e) => { e.stopPropagation(); navigate(`/course/${course._id}`); }}
        >
          View Course →
        </button>
      </div>
    </div>
  );
}
