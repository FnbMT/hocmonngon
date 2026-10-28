import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download, 
  ExternalLink, 
  MessageSquare, 
  BookOpen, 
  FileSpreadsheet, 
  ArrowLeft, 
  Check, 
  Send, 
  Trash2, 
  Sparkles, 
  RotateCcw,
  X,
  AlertCircle,
  Unlock,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, Lesson, Student, Enrollment } from '../types';
import { toYouTubeEmbedUrl, extractYouTubeId, DEFAULT_YOUTUBE_ID } from '../utils/youtube';
import { StorageService } from '../services/storage';
import { 
  getLessonUnlockStatus, 
  getChapterUnlockStatus, 
  getNextUnlockedLesson 
} from '../utils/learningProgress';

interface ClassroomPlayerProps {
  course: Course;
  currentUser: Student;
  enrollment?: Enrollment;
  initialLessonId?: string;
  onToggleComplete: (enrollmentId: string, lessonId: string) => void;
  onUpgradePaid: (course: Course) => void;
  onBack: () => void;
  onSendQuestion: (chefName: string, question: string) => void;
}

export const ClassroomPlayer: React.FC<ClassroomPlayerProps> = ({
  course,
  currentUser,
  enrollment,
  initialLessonId,
  onToggleComplete,
  onUpgradePaid,
  onBack,
  onSendQuestion
}) => {
  // Find effective enrollment (fallback to stored enrollments)
  const effectiveEnrollment = enrollment || StorageService.getStudentEnrollments(currentUser?.id || '').find(e => e.courseId === course.id);
  const isPaid = effectiveEnrollment?.type === 'paid';
  const completedLessonIds = effectiveEnrollment?.completedLessonIds || [];

  // Flatten all lessons
  const allLessons = course.chapters.flatMap(chap => chap.lessons);

  // Find initial lesson: prefer initialLessonId if it's unlocked, or next unlocked incomplete lesson
  const resolvedDefaultLesson = (() => {
    if (initialLessonId) {
      const target = allLessons.find(l => l.id === initialLessonId);
      if (target) {
        const status = getLessonUnlockStatus(course, target.id, completedLessonIds, isPaid);
        if (status.unlocked) return target;
      }
    }
    return getNextUnlockedLesson(course, completedLessonIds, isPaid) || allLessons[0];
  })();

  const [currentLesson, setCurrentLesson] = useState<Lesson>(resolvedDefaultLesson || allLessons[0]);
  const [activeTab, setActiveTab] = useState<'recipe' | 'docs' | 'notes' | 'qa'>('recipe');
  const [userNote, setUserNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [questionSent, setQuestionSent] = useState(false);

  // Auto-play next lesson preference (enabled by default)
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('hocmonngon_autoplay_next');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleAutoPlayNext = () => {
    setAutoPlayNext(prev => {
      const next = !prev;
      try {
        localStorage.setItem('hocmonngon_autoplay_next', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Auto-advance countdown timer state
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer on lesson change or unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
    };
  }, [currentLesson.id]);

  // Modal alert when clicking a locked lesson/chapter or locked Next Lesson
  const [lockedModal, setLockedModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    targetLesson?: Lesson;
    canQuickCompleteCurrent?: boolean;
    nextCandidate?: Lesson;
  } | null>(null);

  // Banner when a lesson or chapter is completed and unlocks new content
  const [unlockSuccessBanner, setUnlockSuccessBanner] = useState<{
    show: boolean;
    title: string;
    message: string;
    nextLesson?: Lesson;
  } | null>(null);

  // Helper to generate automatic lesson notes
  const getDefaultNotesForLesson = (lesson: Lesson) => {
    return [
      `Lưu ý thao tác [${lesson.title}]: Căn chuẩn thời gian và nhiệt độ theo đúng hướng dẫn của Chef.`,
      `Tỷ lệ định lượng gram: Đo chính xác bằng cân điện tử, không ước lượng cảm tính để chất lượng đồng đều 100 bát như 1.`,
      `Bí quyết bảo quản nước cốt/thành phẩm: Giữ nóng ở 85°C hoặc cấp đông -18°C nếu dùng cho các ngày tiếp theo.`
    ];
  };

  // Sync notes from localStorage per lesson
  useEffect(() => {
    if (!currentLesson) return;
    const noteKey = `student_notes_${effectiveEnrollment?.studentId || currentUser?.id || 'guest'}_${course.id}_${currentLesson.id}`;
    const stored = localStorage.getItem(noteKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedNotes(parsed);
          return;
        }
      } catch {
        // Fallback to default
      }
    }
    const defaults = getDefaultNotesForLesson(currentLesson);
    setSavedNotes(defaults);
    try {
      localStorage.setItem(noteKey, JSON.stringify(defaults));
    } catch {}
  }, [currentLesson.id, course.id, effectiveEnrollment?.studentId, currentUser?.id]);

  const isCompleted = completedLessonIds.includes(currentLesson.id);
  const parentChapter = course.chapters.find(chap => chap.lessons.some(l => l.id === currentLesson.id));
  const isChapterFree = parentChapter?.isFree !== false;
  const isDocLocked = !isPaid && currentLesson.requirePaymentForDoc;

  // Calculate sequential unlock status of the currently viewed lesson
  const currentLessonUnlockStatus = getLessonUnlockStatus(
    course,
    currentLesson.id,
    completedLessonIds,
    isPaid
  );
  const isLessonAccessible = currentLessonUnlockStatus.unlocked;

  const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Start auto-advance countdown to next lesson
  const startAutoAdvance = (targetNextLesson: Lesson) => {
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
    }
    setAutoAdvanceCountdown(3);
    let remaining = 3;
    autoAdvanceTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (autoAdvanceTimerRef.current) {
          clearInterval(autoAdvanceTimerRef.current);
        }
        setAutoAdvanceCountdown(null);
        setCurrentLesson(targetNextLesson);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAutoAdvanceCountdown(remaining);
      }
    }, 1000);
  };

  const handleInstantPlayNext = () => {
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
    }
    setAutoAdvanceCountdown(null);
    if (nextLesson) {
      setCurrentLesson(nextLesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
    }
    setAutoAdvanceCountdown(null);
  };

  // Listen to YouTube postMessage event: when video finishes playing (info: 0)
  useEffect(() => {
    const handleYouTubeMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (data && (data.event === 'onStateChange' || data.info !== undefined)) {
          // info === 0 signifies YT.PlayerState.ENDED
          if (data.info === 0) {
            if (effectiveEnrollment && !isCompleted) {
              onToggleComplete(effectiveEnrollment.id, currentLesson.id);
              confetti({ particleCount: 50, spread: 60 });
            }
            if (autoPlayNext && nextLesson) {
              startAutoAdvance(nextLesson);
            }
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, [effectiveEnrollment, isCompleted, currentLesson.id, autoPlayNext, nextLesson]);

  const handleToggleComplete = () => {
    if (!effectiveEnrollment) return;
    onToggleComplete(effectiveEnrollment.id, currentLesson.id);
    
    if (!isCompleted) {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.65 }
      });

      // Check if this completion finishes the entire current chapter
      const chapLessons = parentChapter?.lessons || [];
      const updatedCompleted = [...completedLessonIds, currentLesson.id];
      const isChapFinished = chapLessons.length > 0 && chapLessons.every(l => updatedCompleted.includes(l.id));

      if (isChapFinished) {
        setUnlockSuccessBanner({
          show: true,
          title: '🎉 Hoàn thành chương!',
          message: `Xuất sắc! Bạn đã hoàn thành 100% bài học trong "${parentChapter?.title}". Chương tiếp theo đã mở khóa!`,
          nextLesson: nextLesson || undefined
        });
      } else if (nextLesson) {
        setUnlockSuccessBanner({
          show: true,
          title: '🎉 Đã mở khóa bài tiếp theo!',
          message: `Tuyệt vời! Bạn đã hoàn thành bài học này. Bài tiếp theo "${nextLesson.title.split(' - ')[0]}" đã sẵn sàng để học.`,
          nextLesson
        });
      }

      // Tự động mở khóa và phát bài tiếp theo theo yêu cầu của user
      if (autoPlayNext && nextLesson) {
        startAutoAdvance(nextLesson);
      }

      setTimeout(() => {
        setUnlockSuccessBanner(null);
      }, 7000);
    }
  };

  // Instant complete and play next lesson
  const handleCompleteAndPlayNext = () => {
    if (effectiveEnrollment && !isCompleted) {
      onToggleComplete(effectiveEnrollment.id, currentLesson.id);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    if (nextLesson) {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
      setAutoAdvanceCountdown(null);
      setCurrentLesson(nextLesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextLesson = () => {
    if (!nextLesson) return;
    const nextStatus = getLessonUnlockStatus(course, nextLesson.id, completedLessonIds, isPaid);
    if (!nextStatus.unlocked) {
      if (nextStatus.lockType === 'payment') {
        onUpgradePaid(course);
        return;
      }
      setLockedModal({
        show: true,
        title: 'Bài tiếp theo chưa mở khóa',
        message: nextStatus.reason || `Bạn cần học và hoàn thành bài hiện tại "${currentLesson.title}" để mở khóa bài tiếp theo.`,
        canQuickCompleteCurrent: !isCompleted && Boolean(effectiveEnrollment),
        nextCandidate: nextLesson
      });
      return;
    }
    setCurrentLesson(nextLesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLesson = (lesson: Lesson) => {
    const status = getLessonUnlockStatus(course, lesson.id, completedLessonIds, isPaid);
    if (!status.unlocked) {
      if (status.lockType === 'payment') {
        onUpgradePaid(course);
        return;
      }
      setLockedModal({
        show: true,
        title: status.lockType === 'sequential_chapter' ? 'Chương học đang tạm khóa' : 'Bài học chưa mở khóa',
        message: status.reason || 'Vui lòng hoàn thành bài học trước để mở khóa bài học này.',
        targetLesson: status.prevLesson
      });
      return;
    }
    setCurrentLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickCompleteAndProceed = () => {
    if (effectiveEnrollment && !isCompleted) {
      onToggleComplete(effectiveEnrollment.id, currentLesson.id);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    if (lockedModal?.nextCandidate) {
      setCurrentLesson(lockedModal.nextCandidate);
    }
    setLockedModal(null);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNote.trim()) return;
    const updated = [userNote.trim(), ...savedNotes];
    setSavedNotes(updated);
    setUserNote('');
    try {
      const noteKey = `student_notes_${effectiveEnrollment?.studentId || currentUser?.id || 'guest'}_${course.id}_${currentLesson.id}`;
      localStorage.setItem(noteKey, JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteNote = (idx: number) => {
    const updated = savedNotes.filter((_, i) => i !== idx);
    setSavedNotes(updated);
    try {
      const noteKey = `student_notes_${effectiveEnrollment?.studentId || currentUser?.id || 'guest'}_${course.id}_${currentLesson.id}`;
      localStorage.setItem(noteKey, JSON.stringify(updated));
    } catch {}
  };

  const handleResetDefaultNotes = () => {
    const defaults = getDefaultNotesForLesson(currentLesson);
    setSavedNotes(defaults);
    try {
      const noteKey = `student_notes_${effectiveEnrollment?.studentId || currentUser?.id || 'guest'}_${course.id}_${currentLesson.id}`;
      localStorage.setItem(noteKey, JSON.stringify(defaults));
    } catch {}
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    onSendQuestion(course.instructorName, `[${currentLesson.title}] ${questionText}`);
    setQuestionText('');
    setQuestionSent(true);
    setTimeout(() => setQuestionSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-stone-950 border-b border-stone-800 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer shrink-0"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-stone-400 font-semibold truncate">{course.title.split(' - ')[0]}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 hidden sm:inline-flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Mở khóa tuần tự
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Toggle Switch Tự Động Phát Bài Tiếp Theo */}
          <button
            type="button"
            onClick={toggleAutoPlayNext}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              autoPlayNext 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/80 shadow-xs' 
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
            }`}
            title="Khi học xong bài, hệ thống sẽ tự động mở khóa và phát bài tiếp theo"
          >
            <Sparkles className={`w-3.5 h-3.5 ${autoPlayNext ? 'text-emerald-400' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">Tự động phát tiếp:</span>
            <span className="font-extrabold uppercase">{autoPlayNext ? 'BẬT' : 'TẮT'}</span>
          </button>

          {effectiveEnrollment && (
            <div className="flex items-center gap-2">
              {nextLesson && (
                <button
                  type="button"
                  onClick={handleCompleteAndPlayNext}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-red-700 hover:bg-red-800 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
                  title="Đánh dấu hoàn thành bài này và tự động phát bài kế tiếp"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden md:inline">{isCompleted ? 'Phát bài tiếp theo →' : 'Hoàn thành & Phát bài tiếp →'}</span>
                  <span className="md:hidden">Bài tiếp →</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleComplete}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã học'}</span>
              </button>
            </div>
          )}

          {!isPaid && (
            <button
              onClick={() => onUpgradePaid(course)}
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer"
            >
              Nâng cấp trọn gói
            </button>
          )}
        </div>
      </header>

      {/* Unlock Milestone Banner */}
      {unlockSuccessBanner && unlockSuccessBanner.show && (
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 border-b border-emerald-600/60 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-100 shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base shrink-0">🎉</span>
            <div className="min-w-0">
              <span className="font-extrabold text-white mr-1.5">{unlockSuccessBanner.title}</span>
              <span className="text-emerald-100 text-[11px] truncate">{unlockSuccessBanner.message}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {unlockSuccessBanner.nextLesson && (
              <button
                type="button"
                onClick={() => {
                  if (unlockSuccessBanner.nextLesson) {
                    setCurrentLesson(unlockSuccessBanner.nextLesson);
                  }
                  setUnlockSuccessBanner(null);
                }}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-[11px] rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1"
              >
                <span>Học tiếp ngay →</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setUnlockSuccessBanner(null)}
              className="text-emerald-300 hover:text-white text-xs p-1 cursor-pointer"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Video Player & Tabs */}
        <div className="lg:col-span-8 flex flex-col bg-stone-950 overflow-y-auto">
          {/* Video Player Box */}
          <div className="relative aspect-16/9 bg-black border-b border-stone-800 flex items-center justify-center">
            {isLessonAccessible ? (
              <iframe
                src={toYouTubeEmbedUrl(currentLesson.videoUrl, { autoplay: true })}
                title={currentLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="text-center p-8 max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20 shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>

                {currentLessonUnlockStatus.lockType === 'payment' ? (
                  <>
                    <h3 className="text-lg font-black text-white">
                      Bài học này thuộc gói Học Trọn Gói
                    </h3>
                    <p className="text-xs text-stone-400">
                      Bạn đang dùng tài khoản học thử. Hãy đăng ký khóa học trọn gói để mở khóa toàn bộ {allLessons.length} bài học, file PDF công thức và file tính giá vốn Excel.
                    </p>
                    <button
                      onClick={() => onUpgradePaid(course)}
                      className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      Đăng Ký Mở Khóa Trọn Gói Ngay
                    </button>
                  </>
                ) : currentLessonUnlockStatus.lockType === 'sequential_chapter' ? (
                  <>
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800/60 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Chương học đang tạm khóa
                      </span>
                      <h3 className="text-lg font-black text-white mt-2">
                        Cần hoàn thành chương trước
                      </h3>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/80 p-3.5 rounded-xl border border-stone-800">
                      {currentLessonUnlockStatus.reason}
                    </p>
                    {currentLessonUnlockStatus.prevChapter && (
                      <button
                        onClick={() => {
                          const prevLessons = currentLessonUnlockStatus.prevChapter?.lessons || [];
                          const target = prevLessons.find(l => !completedLessonIds.includes(l.id)) || prevLessons[0];
                          if (target) {
                            setCurrentLesson(target);
                          }
                        }}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Quay về hoàn thành chương trước →</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800/60 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Mở khóa tuần tự
                      </span>
                      <h3 className="text-lg font-black text-white mt-2">
                        Bài học chưa mở khóa
                      </h3>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/80 p-3.5 rounded-xl border border-stone-800">
                      {currentLessonUnlockStatus.reason}
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      {currentLessonUnlockStatus.prevLesson && (
                        <button
                          onClick={() => {
                            if (currentLessonUnlockStatus.prevLesson) {
                              setCurrentLesson(currentLessonUnlockStatus.prevLesson);
                            }
                          }}
                          className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-stone-300" />
                          <span>Học bài trước: {currentLessonUnlockStatus.prevLesson.title.split(' - ')[0]}</span>
                        </button>
                      )}
                      {effectiveEnrollment && currentLessonUnlockStatus.prevLesson && (
                        <button
                          onClick={() => {
                            if (currentLessonUnlockStatus.prevLesson && effectiveEnrollment) {
                              onToggleComplete(effectiveEnrollment.id, currentLessonUnlockStatus.prevLesson.id);
                              confetti({ particleCount: 40, spread: 50 });
                            }
                          }}
                          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã học xong bài trước → Mở khóa bài này</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Auto-Advance Countdown Overlay (Tự động mở khóa & phát bài tiếp theo) */}
            {autoAdvanceCountdown !== null && nextLesson && (
              <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-4 relative shadow-lg">
                  <span className="text-2xl font-black">{autoAdvanceCountdown}</span>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
                </div>
                <span className="text-[11px] font-bold px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full mb-2 flex items-center gap-1.5 shadow-xs">
                  <Check className="w-3.5 h-3.5" />
                  Bài học đã hoàn thành
                </span>
                <h3 className="text-base sm:text-lg font-black text-white max-w-md line-clamp-2 leading-tight">
                  Tự động mở khóa & phát bài tiếp: {nextLesson.title}
                </h3>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  Video bài học tiếp theo sẽ tự động phát sau {autoAdvanceCountdown} giây...
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={handleInstantPlayNext}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Phát ngay bây giờ</span>
                  </button>
                  <button
                    onClick={handleCancelAutoAdvance}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-stone-700"
                  >
                    Ở lại xem lại bài này
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Unlisted Video Status Bar */}
          {isLessonAccessible && (
            <div className="px-4 py-2 bg-stone-900 border-b border-stone-800 flex flex-wrap items-center justify-between text-[11px] text-stone-400 gap-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Video YouTube (Hỗ trợ chế độ Không Công Khai / Unlisted)</span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${extractYouTubeId(currentLesson.videoUrl) || DEFAULT_YOUTUBE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Mở xem trực tiếp trên YouTube</span>
              </a>
            </div>
          )}

          {/* Player controls */}
          <div className="p-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
            <button
              disabled={!prevLesson}
              onClick={() => prevLesson && setCurrentLesson(prevLesson)}
              className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bài trước</span>
            </button>

            <div className="text-center">
              <span className="text-xs text-stone-300 font-bold block">
                Bài {currentLessonIndex + 1} / {allLessons.length}
              </span>
              <span className="text-[10px] text-stone-500">
                Thời lượng: {currentLesson.durationMinutes} phút
              </span>
            </div>

            <button
              disabled={!nextLesson}
              onClick={handleNextLesson}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 flex items-center gap-1.5 cursor-pointer transition-colors ${
                nextLesson && !getLessonUnlockStatus(course, nextLesson.id, completedLessonIds, isPaid).unlocked
                  ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
            >
              <span>Bài tiếp theo</span>
              {nextLesson && !getLessonUnlockStatus(course, nextLesson.id, completedLessonIds, isPaid).unlocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-stone-800 bg-stone-900 px-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('recipe')}
              className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'recipe' ? 'border-red-600 text-red-500' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Công thức chi tiết
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'docs' ? 'border-red-600 text-red-500' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Tài liệu & File đính kèm
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'notes' ? 'border-red-600 text-red-500' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Ghi chú của tôi ({savedNotes.length})
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'qa' ? 'border-red-600 text-red-500' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Hỏi đáp cùng Bếp trưởng
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-stone-950 flex-1 text-sm leading-relaxed text-stone-300">
            {activeTab === 'recipe' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Bí quyết & Công thức: {currentLesson.title}</span>
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-900/50">
                    Chuẩn vị Bếp Trưởng
                  </span>
                </div>

                {currentLesson.recipeText && currentLesson.recipeText.trim() ? (
                  <div className="text-stone-300 bg-stone-900 p-4 rounded-xl border border-stone-800 whitespace-pre-line text-xs leading-relaxed font-mono">
                    {currentLesson.recipeText}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-2.5">
                      <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                        <span>📌 Định Lượng & Kỹ Thuật Thao Tác Chuẩn:</span>
                      </div>
                      <p>
                        • <strong>Nguyên liệu chính:</strong> 1kg nguyên liệu tươi chọn loại 1, khử sạch mùi nồng với nước muối loãng và gừng giã dập.
                      </p>
                      <p>
                        • <strong>Gia vị chuẩn gram:</strong> 35g muối tinh sấy, 45ml nước mắm cốt nhĩ 40 độ đạm, 20g đường phèn hoa vàng, 10g tiêu thơm rang dập.
                      </p>
                      <p>
                        • <strong>Nhiệt độ ninh:</strong> Duy trì liên tục ở 90°C - 92°C, hớt bọt nhẹ nhàng trong 20 phút đầu, tuyệt đối không đậy kín vung.
                      </p>
                      <p>
                        • <strong>Túi thơm gia truyền:</strong> Rang thơm hồi quế thảo quả trên chảo gang trước khi thả vào nồi nước dùng ở 45 phút cuối.
                      </p>
                    </div>

                    <div className="p-3 bg-red-950/40 rounded-xl border border-red-900/40 text-[11px] text-red-300">
                      * Lưu ý: Toàn bộ công thức trên đã được chuẩn hóa bởi Bếp Trưởng cho quy mô mở quán kinh doanh. Tuyệt đối không tự ý thay đổi tỷ lệ muối và nước mắm cốt nhĩ.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="space-y-4 max-w-xl">
                <h3 className="font-extrabold text-white text-base">
                  Tài liệu & Công thức độc quyền
                </h3>

                {isDocLocked ? (
                  <div className="p-5 bg-stone-900 rounded-2xl border border-purple-900/50 space-y-3 text-center">
                    <div className="w-12 h-12 bg-purple-950 rounded-xl flex items-center justify-center mx-auto text-purple-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm">
                        File Tài Liệu & Công Thức Yêu Cầu Thanh Toán
                      </h4>
                      <p className="text-xs text-stone-400">
                        Bài học này cho phép xem video hướng dẫn miễn phí, nhưng file PDF công thức gram chuẩn và Excel tính giá cost được bán riêng kèm gói học trọn gói.
                      </p>
                    </div>
                    <button
                      onClick={() => onUpgradePaid(course)}
                      className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Mở Khóa Trọn Bộ Tài Liệu Ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-red-950 text-red-500">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">
                            File PDF Công Thức Gram Chuẩn (Mở quán)
                          </h4>
                          <p className="text-[11px] text-stone-400">
                            Định lượng chi tiết cho mẻ 50 - 200 bát • PDF 4.2 MB
                          </p>
                        </div>
                      </div>
                      <a
                        href={currentLesson.recipeDocumentUrl || course.pdfRecipeUrl || 'https://drive.google.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer text-stone-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải về</span>
                      </a>
                    </div>

                    <div className="p-4 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-500">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">
                            Bảng Tính Giá Vốn & Lợi Nhuận Tự Động (Excel)
                          </h4>
                          <p className="text-[11px] text-stone-400">
                            Tự động tính cost từng bát theo giá chợ địa phương • XLSX 1.8 MB
                          </p>
                        </div>
                      </div>
                      <a
                        href={course.excelCostSheetUrl || 'https://drive.google.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer text-stone-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải Excel</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      Ghi chú cá nhân cho bài: {currentLesson.title.split(' - ')[0]}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Hệ thống tự động lưu trữ ghi chú của bạn và gợi ý lưu ý thực hành của Bếp trưởng.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetDefaultNotes}
                    className="text-stone-400 hover:text-amber-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer bg-stone-900 px-2.5 py-1.5 rounded-lg border border-stone-800"
                    title="Nạp lại ghi chú mặc định của Chef cho bài học này"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Lấy lại ghi chú Chef</span>
                  </button>
                </div>

                <form onSubmit={handleSaveNote} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Viết thêm ghi chú cá nhân khi đang xem video (lưu tự động vào bài học này)..."
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full p-3 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-stone-500">
                      Đã lưu {savedNotes.length} ghi chú cho bài học này
                    </span>
                    <button
                      type="submit"
                      disabled={!userNote.trim()}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      Lưu ghi chú
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-2">
                  {savedNotes.map((note, i) => (
                    <div key={i} className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-start justify-between gap-3 group hover:border-stone-700 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-500 shrink-0 mt-0.5">📝</span>
                        <span className="leading-relaxed whitespace-pre-line">{note}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(i)}
                        className="opacity-50 group-hover:opacity-100 text-stone-400 hover:text-red-400 p-1 transition-opacity cursor-pointer shrink-0"
                        title="Xóa ghi chú này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="font-extrabold text-white text-base">
                  Đặt câu hỏi cho Bếp trưởng về bài học này
                </h3>
                <form onSubmit={handleAskQuestion} className="space-y-2">
                  <textarea
                    rows={3}
                    required
                    placeholder="Thầy ơi, đoạn ninh xương em chưa hiểu rõ về..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full p-3 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi câu hỏi</span>
                  </button>
                </form>

                {questionSent && (
                  <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
                    Đã gửi câu hỏi tới {course.instructorName}! Bếp trưởng sẽ giải đáp trực tiếp trên hệ thống.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Chapter & Lessons Navigation List with Sequential Locks */}
        <div className="lg:col-span-4 bg-stone-900 border-l border-stone-800 flex flex-col h-[calc(100vh-60px)] overflow-y-auto">
          <div className="p-4 border-b border-stone-800 bg-stone-950 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-white text-sm">
                Giáo trình khóa học
              </h2>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                Tự động mở khóa
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {completedLessonIds.length}/{allLessons.length} bài hoàn thành • Học xong bài tự động chuyển bài tiếp theo
            </p>
          </div>

          <div className="p-3 space-y-4 flex-1">
            {course.chapters.map((chap) => {
              const chapterIsFree = chap.isFree !== false;
              const chapStatus = getChapterUnlockStatus(course, chap.id, completedLessonIds, isPaid);
              const isChapterLocked = !chapStatus.unlocked;

              return (
                <div 
                  key={chap.id} 
                  className={`space-y-1.5 p-2 rounded-xl transition-all ${
                    isChapterLocked 
                      ? 'bg-stone-950/60 border border-stone-800/80 opacity-85' 
                      : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isChapterLocked && (
                        <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <p className={`text-xs font-bold line-clamp-1 ${isChapterLocked ? 'text-stone-400' : 'text-stone-300'}`}>
                        {chap.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isChapterLocked ? (
                        <span className="px-2 py-0.5 bg-amber-950/90 text-amber-400 border border-amber-900/60 rounded text-[9px] font-bold">
                          Khóa theo chương
                        </span>
                      ) : !chapterIsFree ? (
                        <span className="px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-900/60 rounded text-[9px] font-bold">
                          Khóa cả chương
                        </span>
                      ) : chapStatus.isFullyCompleted ? (
                        <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/60 rounded text-[9px] font-bold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          Hoàn thành
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-medium">
                          {chapStatus.completedLessons}/{chapStatus.totalLessons} bài
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {chap.lessons.map(lesson => {
                      const isSelected = lesson.id === currentLesson.id;
                      const isCompletedLesson = completedLessonIds.includes(lesson.id);
                      const lessonStatus = getLessonUnlockStatus(course, lesson.id, completedLessonIds, isPaid);
                      const isUnlocked = lessonStatus.unlocked;

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-red-700 text-white font-bold ring-2 ring-red-400/30'
                              : isUnlocked
                              ? 'bg-stone-800/60 hover:bg-stone-800 text-stone-300'
                              : 'bg-stone-950/70 hover:bg-stone-900 text-stone-500 border border-stone-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isCompletedLesson ? (
                              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                            ) : isUnlocked ? (
                              <Play className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'fill-white text-white' : 'text-stone-400'}`} />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isUnlocked && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-900 text-stone-400 border border-stone-800">
                                {lessonStatus.lockType === 'payment' ? 'Có phí' : 'Khóa'}
                              </span>
                            )}
                            {isUnlocked && !isPaid && lesson.isFreeTrial && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-stone-950">
                                Thử
                              </span>
                            )}
                            {lesson.requirePaymentForDoc && (
                              <span className="text-[9px] text-amber-400 font-semibold hidden sm:inline">
                                [Công thức có phí]
                              </span>
                            )}
                            <span className={`text-[10px] ${isSelected ? 'text-white/80' : isUnlocked ? 'text-stone-500' : 'text-stone-600'}`}>
                              {lesson.durationMinutes}p
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Cảnh Báo Bài Học / Chương Chưa Mở Khóa */}
      {lockedModal && lockedModal.show && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 text-stone-100 max-w-md w-full rounded-2xl border border-stone-700 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">
                  {lockedModal.title}
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {lockedModal.message}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {lockedModal.canQuickCompleteCurrent && (
                <button
                  type="button"
                  onClick={handleQuickCompleteAndProceed}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Đã học xong bài này & Tự động phát bài tiếp theo</span>
                </button>
              )}

              {lockedModal.targetLesson && (
                <button
                  type="button"
                  onClick={() => {
                    if (lockedModal.targetLesson) {
                      setCurrentLesson(lockedModal.targetLesson);
                    }
                    setLockedModal(null);
                  }}
                  className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Chuyển tới bài cần hoàn thành trước</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setLockedModal(null)}
                className="w-full py-2 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
