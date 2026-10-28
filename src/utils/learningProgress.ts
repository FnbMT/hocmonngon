import { Course, Chapter, Lesson } from '../types';

export interface LessonUnlockStatus {
  unlocked: boolean;
  reason?: string;
  lockType?: 'payment' | 'sequential_lesson' | 'sequential_chapter';
  prevLesson?: Lesson;
  prevChapter?: Chapter;
}

export interface ChapterUnlockStatus {
  unlocked: boolean;
  reason?: string;
  prevChapter?: Chapter;
  completedLessons: number;
  totalLessons: number;
  isFullyCompleted: boolean;
}

/**
 * Kiểm tra xem một chương đã được mở khóa hay chưa.
 * Quy tắc: Hoàn thành 100% tất cả các bài học trong chương trước thì mới mở khóa chương sau.
 */
export function getChapterUnlockStatus(
  course: Course,
  chapterId: string,
  completedLessonIds: string[] = [],
  _isPaid: boolean = false
): ChapterUnlockStatus {
  const chapters = course.chapters || [];
  const chapIndex = chapters.findIndex(c => c.id === chapterId);
  
  if (chapIndex === -1) {
    return {
      unlocked: false,
      reason: 'Chương không tồn tại trên hệ thống.',
      completedLessons: 0,
      totalLessons: 0,
      isFullyCompleted: false
    };
  }

  const currentChapter = chapters[chapIndex];
  const currentChapterLessons = currentChapter.lessons || [];
  const completedInCurrent = currentChapterLessons.filter(l => completedLessonIds.includes(l.id)).length;
  const isFullyCompleted = currentChapterLessons.length > 0 && completedInCurrent === currentChapterLessons.length;

  // Chương đầu tiên (Chương 1) luôn được mở khóa theo tiến độ
  if (chapIndex === 0) {
    return {
      unlocked: true,
      completedLessons: completedInCurrent,
      totalLessons: currentChapterLessons.length,
      isFullyCompleted
    };
  }

  // Với các chương sau (Chương 2, 3, ...), phải hoàn thành TOÀN BỘ bài học của chương liền trước
  const prevChapter = chapters[chapIndex - 1];
  const prevLessons = prevChapter.lessons || [];
  const allPrevCompleted = prevLessons.length > 0 && prevLessons.every(l => completedLessonIds.includes(l.id));

  if (!allPrevCompleted) {
    const prevCompletedCount = prevLessons.filter(l => completedLessonIds.includes(l.id)).length;
    return {
      unlocked: false,
      reason: `Bạn cần hoàn thành tất cả bài học trong "${prevChapter.title}" (${prevCompletedCount}/${prevLessons.length} bài) để mở khóa chương này.`,
      prevChapter,
      completedLessons: completedInCurrent,
      totalLessons: currentChapterLessons.length,
      isFullyCompleted
    };
  }

  return {
    unlocked: true,
    completedLessons: completedInCurrent,
    totalLessons: currentChapterLessons.length,
    isFullyCompleted
  };
}

/**
 * Kiểm tra xem một bài học cụ thể đã được mở khóa hay chưa.
 * Quy tắc:
 * 1. Phải thỏa mãn quyền học (đã mua trọn gói HOẶC bài học thử miễn phí).
 * 2. Nếu đã hoàn thành trong quá khứ thì luôn mở khóa để học viên xem lại bất cứ lúc nào.
 * 3. Chương chứa bài học này phải đã được mở khóa (hoàn thành chương trước).
 * 4. Bài học liền trước phải đã hoàn thành thì mới mở khóa bài học tiếp theo.
 */
export function getLessonUnlockStatus(
  course: Course,
  lessonId: string,
  completedLessonIds: string[] = [],
  isPaid: boolean = false
): LessonUnlockStatus {
  const allLessons = (course.chapters || []).flatMap(c => c.lessons || []);
  const lessonIndex = allLessons.findIndex(l => l.id === lessonId);

  if (lessonIndex === -1) {
    return {
      unlocked: false,
      reason: 'Bài học không tồn tại.'
    };
  }

  const lesson = allLessons[lessonIndex];
  const parentChapter = (course.chapters || []).find(c => (c.lessons || []).some(l => l.id === lessonId));

  // 1. Kiểm tra quyền trả phí / học thử
  const isChapterFree = parentChapter?.isFree !== false;
  const canAccessByPrice = isPaid || (isChapterFree && lesson.isFreeTrial);

  if (!canAccessByPrice) {
    return {
      unlocked: false,
      reason: 'Bài học này thuộc gói học Trọn Gói. Vui lòng đăng ký khóa học để mở khóa toàn bộ.',
      lockType: 'payment'
    };
  }

  // 2. Nếu bài học này đã được học xong trước đó, cho phép xem lại tự do bất kỳ lúc nào
  if (completedLessonIds.includes(lessonId)) {
    return {
      unlocked: true
    };
  }

  // 3. Kiểm tra tiến độ chương (chương trước phải hoàn thành hết các bài)
  if (parentChapter) {
    const chapterStatus = getChapterUnlockStatus(course, parentChapter.id, completedLessonIds, isPaid);
    if (!chapterStatus.unlocked) {
      return {
        unlocked: false,
        reason: chapterStatus.reason || `Chương "${parentChapter.title}" đang khóa. Bạn cần hoàn thành toàn bộ chương trước.`,
        lockType: 'sequential_chapter',
        prevChapter: chapterStatus.prevChapter
      };
    }
  }

  // 4. Kiểm tra tiến độ bài học: Bài học đầu tiên của khóa học luôn mở
  if (lessonIndex === 0) {
    return {
      unlocked: true
    };
  }

  // Bài học liền trước phải hoàn thành
  const prevLesson = allLessons[lessonIndex - 1];
  const isPrevCompleted = completedLessonIds.includes(prevLesson.id);

  if (!isPrevCompleted) {
    return {
      unlocked: false,
      reason: `Bạn cần hoàn thành bài học trước: "${prevLesson.title}" để mở khóa bài học này.`,
      lockType: 'sequential_lesson',
      prevLesson
    };
  }

  return {
    unlocked: true
  };
}

/**
 * Tìm bài học tiếp theo cần học trong lộ trình (bài chưa hoàn thành nhưng đã mở khóa)
 */
export function getNextUnlockedLesson(
  course: Course,
  completedLessonIds: string[] = [],
  isPaid: boolean = false
): Lesson | null {
  const allLessons = (course.chapters || []).flatMap(c => c.lessons || []);
  
  // Tìm bài đầu tiên đã mở khóa nhưng chưa hoàn thành
  for (const lesson of allLessons) {
    if (!completedLessonIds.includes(lesson.id)) {
      const status = getLessonUnlockStatus(course, lesson.id, completedLessonIds, isPaid);
      if (status.unlocked) {
        return lesson;
      }
    }
  }

  // Nếu đã hoàn thành hết hoặc không tìm thấy, trả về bài cuối cùng hoặc bài đầu tiên
  return allLessons[0] || null;
}
