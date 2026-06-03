import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import LessonSidebar from '../components/LessonSidebar';
import ProgressBar from '../components/ProgressBar';

export default function LearnPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchLearnData();
  }, [courseId]);

  const fetchLearnData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/learn/${courseId}`);
      setCourse(data.course);
      setCompletedLessons(data.progress.completedLessons || []);
      setProgressPercent(data.progress.progressPercent || 0);

      // Set first lesson as active by default
      if (data.course.modules?.[0]?.lessons?.[0]) {
        setCurrentLesson({
          ...data.course.modules[0].lessons[0],
          id: '0-0',
          moduleIdx: 0,
          lessonIdx: 0,
        });
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('You are not enrolled in this course');
        navigate(`/course/${courseId}`);
      } else {
        toast.error('Failed to load course');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || marking) return;
    if (completedLessons.includes(currentLesson.id)) {
      toast.info('This lesson is already marked as complete');
      return;
    }

    setMarking(true);
    try {
      const { data } = await api.post('/api/learn/complete', {
        courseId,
        lessonId: currentLesson.id,
      });
      setCompletedLessons(data.completedLessons);
      setProgressPercent(data.progressPercent);
      toast.success('✅ Lesson marked as complete!');

      if (data.progressPercent === 100) {
        toast.success('🎉 Congratulations! You completed the course!', { autoClose: 5000 });
      }
    } catch {
      toast.error('Failed to mark lesson complete');
    } finally {
      setMarking(false);
    }
  };

  const isCurrentComplete = currentLesson && completedLessons.includes(currentLesson.id);

  // Get YouTube embed URL or use direct URL
  const getVideoUrl = (url) => {
    if (!url) return null;
    // Already an embed URL
    if (url.includes('/embed/')) return url;
    // Convert youtube.com/watch?v=ID or youtu.be/ID
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)' }}>
      <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  if (!course) return null;

  const videoUrl = getVideoUrl(currentLesson?.videoUrl);

  return (
    <div className="learn-layout">
      {/* Sidebar */}
      <LessonSidebar
        course={course}
        currentLesson={currentLesson}
        completedLessons={completedLessons}
        onSelect={setCurrentLesson}
      />

      {/* Main area */}
      <main className="learn-main">
        {/* Top bar with progress */}
        <div className="learn-top-bar">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)', flexShrink: 0 }}>
            Your Progress
          </span>
          <ProgressBar percent={progressPercent} />
          <span className="text-xs text-muted" style={{ flexShrink: 0 }}>
            {completedLessons.length} / {course.modules?.reduce((s, m) => s + m.lessons.length, 0)} done
          </span>
        </div>

        {/* Video Player */}
        {currentLesson && videoUrl ? (
          <div className="video-container">
            <iframe
              src={videoUrl}
              title={currentLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              id="lesson-video"
            />
          </div>
        ) : currentLesson ? (
          <div style={{
            background: '#111',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexDirection: 'column',
            gap: 12,
          }}>
            <span style={{ fontSize: '3rem' }}>▶</span>
            <p>No video URL for this lesson</p>
          </div>
        ) : null}

        {/* Lesson Content */}
        <div className="learn-content">
          {currentLesson ? (
            <>
              <div className="lesson-title-bar">
                <div>
                  <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>{currentLesson.title}</h1>
                  <p className="text-sm text-muted">
                    Module {currentLesson.moduleIdx + 1} · Lesson {currentLesson.lessonIdx + 1}
                    {currentLesson.duration && ` · ${currentLesson.duration}`}
                  </p>
                </div>
                <button
                  className={`btn ${isCurrentComplete ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleMarkComplete}
                  disabled={marking || isCurrentComplete}
                  id="mark-complete-btn"
                  style={{ flexShrink: 0 }}
                >
                  {marking ? (
                    <><span className="spinner" /> Saving...</>
                  ) : isCurrentComplete ? (
                    '✓ Completed'
                  ) : (
                    'Mark as Complete'
                  )}
                </button>
              </div>

              <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
              }}>
                <h4 className="mb-2">About this lesson</h4>
                <p className="text-muted">
                  This lesson is part of <strong>{course.title}</strong>. Watch the video above and mark it
                  as complete when you're ready to move on to the next lesson.
                </p>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📖</div>
              <h3>Select a lesson to begin</h3>
              <p className="mt-2">Choose a lesson from the sidebar to start learning.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
