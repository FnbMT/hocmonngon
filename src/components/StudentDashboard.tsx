import React, { useState } from 'react';
import { 
  Play, 
  Award, 
  Bookmark, 
  Clock, 
  FileText, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Send,
  BookOpen
} from 'lucide-react';
import { Course, Student, Enrollment, ChefQuestion } from '../types';

interface StudentDashboardProps {
  currentUser: Student;
  enrollments: Enrollment[];
  courses: Course[];
  questions: ChefQuestion[];
  onOpenPlayer: (course: Course, lessonId?: string) => void;
  onUpgradeTrial: (course: Course) => void;
  onSendQuestion: (chefName: string, question: string) => void;
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  enrollments,
  courses,
  questions,
  onOpenPlayer,
  onUpgradeTrial,
  onSendQuestion,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'learning' | 'completed' | 'trial'>('all');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedChefName, setSelectedChefName] = useState('Chef Nguyễn Văn Tuấn');
  const [questionSentNotice, setQuestionSentNotice] = useState(false);

  // Separate enrollments
  const paidEnrollments = enrollments.filter(e => e.type === 'paid');
  const trialEnrollments = enrollments.filter(e => e.type === 'trial');
  const learningEnrollments = paidEnrollments.filter(e => e.status !== 'completed');
  const completedEnrollments = paidEnrollments.filter(e => e.status === 'completed');

  // Filtered by tab
  const displayedEnrollments = enrollments.filter(e => {
    if (activeTab === 'all') return e.type === 'paid';
    if (activeTab === 'learning') return e.type === 'paid' && e.status !== 'completed';
    if (activeTab === 'completed') return e.status === 'completed';
    if (activeTab === 'trial') return e.type === 'trial';
    return true;
  });

  // Featured "Đang học dở" course (e.g. Pho Bo)
  const heroEnrollment = learningEnrollments[0] || paidEnrollments[0] || enrollments[0];
  const heroCourse = heroEnrollment ? courses.find(c => c.id === heroEnrollment.courseId) : null;
  const heroTotalLessons = heroCourse ? heroCourse.chapters.reduce((acc, c) => acc + c.lessons.length, 0) : 18;
  const heroCompletedCount = heroEnrollment ? heroEnrollment.completedLessonIds.length : 12;
  const heroProgressPercent = Math.round((heroCompletedCount / (heroTotalLessons || 1)) * 100);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    onSendQuestion(selectedChefName, newQuestionText);
    setNewQuestionText('');
    setQuestionSentNotice(true);
    setTimeout(() => setQuestionSentNotice(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner matching Image 5 */}
        <div className="rounded-3xl bg-linear-to-r from-red-700 via-red-800 to-stone-900 text-white p-7 sm:p-9 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Chào mừng trở lại, {currentUser.name}!
            </h1>
            <p className="text-red-100 text-sm">
              Chúc bạn nấu ăn thật vui và thành công hôm nay.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {heroCourse && (
              <button
                onClick={() => onOpenPlayer(heroCourse)}
                className="px-5 py-2.5 bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Vào bếp ngay
              </button>
            )}
            <button
              onClick={() => onNavigate('catalog')}
              className="px-5 py-2.5 bg-red-900/60 hover:bg-red-900/90 text-white border border-white/20 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              Khám phá thêm
            </button>
          </div>
        </div>

        {/* 4 Stat Cards matching Image 5 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs relative overflow-hidden">
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">
              Đang học
            </span>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                {paidEnrollments.length} Khóa học
              </span>
              <p className="text-xs text-stone-500">
                {learningEnrollments.length} đang học, {completedEnrollments.length} hoàn thành
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs relative overflow-hidden">
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
              Trải nghiệm
            </span>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                {trialEnrollments.length} Khóa thử
              </span>
              <p className="text-xs text-stone-500">
                Thời hạn còn 5 ngày
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs relative overflow-hidden">
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
              Chứng chỉ
            </span>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                {completedEnrollments.length > 0 ? '1' : '0'} Chứng chỉ
              </span>
              <p className="text-xs text-stone-500">
                {completedEnrollments[0]?.courseTitle || 'Đang rèn luyện'}
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs relative overflow-hidden">
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
              Đã lưu
            </span>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                14 Công thức
              </span>
              <p className="text-xs text-stone-500">
                Ghi chú bếp đã lưu
              </p>
            </div>
          </div>
        </div>

        {/* Featured "ĐANG HỌC DỞ" Hero Section matching Image 5 */}
        {heroCourse && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Image with overlay button */}
              <div 
                onClick={() => onOpenPlayer(heroCourse)}
                className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-16/10 bg-stone-900 shadow-md group cursor-pointer"
              >
                <img
                  src={heroCourse.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                  alt={heroCourse.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 bg-red-700/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-xs">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Tiếp tục bài học gần nhất</span>
                </div>
              </div>

              {/* Right Progress Details matching Image 5 */}
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 text-[10px] font-extrabold uppercase tracking-wider inline-block mb-2">
                    ĐANG HỌC DỞ
                  </span>
                  <h2 className="text-2xl font-black text-stone-900 leading-snug">
                    {heroCourse.title}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Bài 13: Kỹ thuật căn chỉnh lửa, lọc bọt và ủ hương thảo mộc bí truyền
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>Tiến độ học tập</span>
                    <span className="text-red-700">{heroProgressPercent}% ({heroCompletedCount}/{heroTotalLessons} bài đã hoàn thành)</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-700 rounded-full transition-all duration-500"
                      style={{ width: `${heroProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons matching Image 5 */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onOpenPlayer(heroCourse)}
                    className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Tiếp Tục Học (18 phút còn lại)</span>
                  </button>
                  <button
                    onClick={() => onNavigate('course', { courseId: heroCourse.id })}
                    className="px-5 py-3 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm rounded-xl border border-stone-300 transition-all cursor-pointer"
                  >
                    Xem giáo trình chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Khóa Học Của Tôi matching Image 5 */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Khóa Học Của Tôi
            </h2>

            {/* Filter Tabs matching Image 5 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                Tất cả khóa học ({paidEnrollments.length})
              </button>
              <button
                onClick={() => setActiveTab('learning')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'learning'
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                Đang học ({learningEnrollments.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'completed'
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                Đã hoàn thành ({completedEnrollments.length})
              </button>
              <button
                onClick={() => setActiveTab('trial')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'trial'
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                Khóa thử ({trialEnrollments.length})
              </button>
            </div>
          </div>

          {/* Course Cards Grid matching Image 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEnrollments.map(enr => {
              const course = courses.find(c => c.id === enr.courseId);
              const totalLessons = course ? course.chapters.reduce((acc, c) => acc + c.lessons.length, 0) : 18;
              const completedCount = enr.completedLessonIds.length;
              const percent = enr.status === 'completed' ? 100 : Math.round((completedCount / (totalLessons || 1)) * 100);

              return (
                <div
                  key={enr.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
                      <img
                        src={enr.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                        alt={enr.courseTitle}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          enr.status === 'completed'
                            ? 'bg-amber-600 text-white'
                            : 'bg-red-700 text-white'
                        }`}>
                          {enr.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-[11px] text-stone-500 font-semibold">{enr.instructorName}</p>
                        <h3 className="font-extrabold text-stone-900 text-base line-clamp-1">
                          {enr.courseTitle}
                        </h3>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-stone-600">
                          <span>Tiến độ</span>
                          <span className="text-red-700">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-700 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 pt-0.5">
                          {enr.status === 'completed' ? 'Đã nhận chứng chỉ tốt nghiệp' : `Hoạt động gần nhất: ${enr.lastActiveAt}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons matching Image 5 */}
                  <div className="p-5 pt-0 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => course && onOpenPlayer(course)}
                      className="col-span-2 py-2 px-3 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-center"
                    >
                      {enr.status === 'completed' ? 'Xem lại bài học' : 'Vào bài học'}
                    </button>

                    {enr.status === 'completed' ? (
                      <button
                        onClick={() => alert(`Chứng chỉ Tốt Nghiệp Khóa Học ${enr.courseTitle} cấp cho ${currentUser.name}`)}
                        className="py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Chứng chỉ
                      </button>
                    ) : (
                      <a
                        href={course?.zaloGroupLink || 'https://zalo.me'}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        Zalo
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: TRẢI NGHIỆM MIỄN PHÍ - Khóa Học Thử Miễn Phí Của Bạn matching Image 5 */}
        {trialEnrollments.length > 0 && (
          <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                  TRẢI NGHIỆM MIỄN PHÍ
                </span>
                <h3 className="text-xl font-black text-stone-900">
                  Khóa Học Thử Miễn Phí Của Bạn
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Còn 4 ngày 18 giờ
              </span>
            </div>

            <div className="space-y-3">
              {trialEnrollments.map(trialEnr => {
                const course = courses.find(c => c.id === trialEnr.courseId);
                return (
                  <div
                    key={trialEnr.id}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200 gap-4"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={trialEnr.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                        alt={trialEnr.courseTitle}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <p className="text-[11px] font-semibold text-stone-500">{trialEnr.instructorName}</p>
                        <h4 className="font-bold text-sm text-stone-900">{trialEnr.courseTitle}</h4>
                        <p className="text-xs text-red-700 font-semibold mt-0.5">
                          {trialEnr.completedLessonIds.length}/3 bài miễn phí đã hoàn thành
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => course && onOpenPlayer(course)}
                        className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Học tiếp bài thử số 2
                      </button>
                      <button
                        onClick={() => course && onUpgradeTrial(course)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Nâng cấp trọn đời (-25% ưu đãi)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section: HỖ TRỢ 1-1 CÙNG CHUYÊN GIA matching Image 5 */}
        <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 block">
              HỖ TRỢ 1-1 CÙNG CHUYÊN GIA
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              Gửi câu hỏi nấu ăn trực tiếp cho Bếp trưởng
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">
              Gặp khó khăn trong quá trình thực hành? Gửi ngay hình ảnh hoặc thắc mắc để nhận giải đáp chi tiết từ giảng viên trong vòng 24h.
            </p>
          </div>

          <form onSubmit={handleAskQuestion} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Nhập câu hỏi của bạn..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="flex-1 px-4 py-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi câu hỏi</span>
            </button>
          </form>

          {questionSentNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã gửi câu hỏi tới Bếp trưởng thành công! Bếp trưởng sẽ giải đáp sớm nhất qua mục này.</span>
            </div>
          )}

          {/* List of recent Q&A */}
          {questions.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Lịch sử giải đáp của Bếp Trưởng:
              </h4>
              {questions.slice(0, 3).map((q) => (
                <div key={q.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <div className="flex justify-between items-start text-stone-700">
                    <p className="font-bold text-stone-900">
                      ❓ {q.question}
                    </p>
                    <span className="text-[10px] text-stone-400 shrink-0 ml-2">{q.createdAt}</span>
                  </div>

                  {q.reply ? (
                    <div className="pl-4 border-l-2 border-red-700 text-stone-700 bg-white p-3 rounded-lg shadow-2xs">
                      <p className="font-extrabold text-red-700 text-[11px] mb-1">
                        👨‍🍳 {q.chefName} trả lời:
                      </p>
                      <p className="leading-relaxed">{q.reply}</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700 italic">
                      ⏳ Đang chờ Bếp trưởng phản hồi (thường trong 24h)...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
