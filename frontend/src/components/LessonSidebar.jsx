export default function LessonSidebar({ course, currentLesson, completedLessons, onSelect }) {
  if (!course) return null;

  return (
    <aside className="learn-sidebar">
      <div className="learn-sidebar-header">
        <h3>{course.title}</h3>
        <p className="text-xs text-muted mt-2">
          {completedLessons.length}/{course.modules?.reduce((s, m) => s + m.lessons.length, 0)} lessons done
        </p>
      </div>

      {course.modules?.map((mod, mi) => (
        <div key={mi} className="sidebar-module">
          <div className="sidebar-module-title">
            Module {mi + 1}: {mod.title}
          </div>
          {mod.lessons?.map((lesson, li) => {
            const lessonId = `${mi}-${li}`;
            const isDone = completedLessons.includes(lessonId);
            const isActive = currentLesson?.id === lessonId;
            return (
              <div
                key={li}
                className={`sidebar-lesson ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                onClick={() => onSelect({ ...lesson, id: lessonId, moduleIdx: mi, lessonIdx: li })}
                role="button"
                tabIndex={0}
                id={`lesson-${lessonId}`}
                onKeyDown={(e) => e.key === 'Enter' && onSelect({ ...lesson, id: lessonId, moduleIdx: mi, lessonIdx: li })}
              >
                <div className={`lesson-check ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                  {isDone && '✓'}
                </div>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{lesson.title}</span>
                <span className="text-xs text-muted">{lesson.duration}</span>
              </div>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
