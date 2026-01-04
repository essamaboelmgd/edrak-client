import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSubdomain } from '@/hooks/useSubdomain'
import { AuthProvider, useAuth, UserRole } from '@/contexts/AuthContext'
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute'

// Lazy load pages
const PlatformHome = lazy(() => import('@/pages/platform/Home'))
const TeacherSite = lazy(() => import('@/pages/sites/TeacherSite'))
const TeacherRegistrationWizard = lazy(() => import('@/features/on-boarding'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignupSelection = lazy(() => import('@/pages/auth/SignupSelection'))
const StudentSignup = lazy(() => import('@/pages/auth/StudentSignup'))
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))

// Role-based pages
const AdminHome = lazy(() => import('@/pages/admin/Home'))
const AdminCourses = lazy(() => import('@/pages/admin/Courses'))
const AdminCourseDetails = lazy(() => import('@/pages/admin/CourseDetails'))
const AdminSectionDetails = lazy(() => import('@/pages/admin/SectionDetails'))
const AdminLessonDetails = lazy(() => import('@/pages/admin/LessonDetails'))
const AdminLessons = lazy(() => import('@/pages/admin/Lessons'))
const AdminTeachers = lazy(() => import('@/pages/admin/Teachers'))
const AdminTeacherDetails = lazy(() => import('@/pages/admin/TeacherDetails'))
const AdminStudents = lazy(() => import('@/pages/admin/Students'))
const AdminStudentDetails = lazy(() => import('@/pages/admin/StudentDetails'))
const AdminActivationCodes = lazy(() => import('@/pages/admin/ActivationCodes'))
const AdminCoupons = lazy(() => import('@/pages/admin/Coupons'))
const TeacherHome = lazy(() => import('@/pages/teacher/Home'))
const TeacherActivationCodes = lazy(() => import('@/pages/teacher/ActivationCodes'))
const TeacherCoupons = lazy(() => import('@/pages/teacher/Coupons'))
// const TeacherCourses = lazy(() => import('@/pages/teacher/Courses'))
const CourseSections = lazy(() => import('@/pages/teacher/courses/CourseSections'))
const Courses = lazy(() => import('@/pages/teacher/courses/Courses'))
const CoursesList = lazy(() => import('@/pages/teacher/courses/CoursesList'))
const CourseBuilder = lazy(() => import('@/pages/teacher/courses/CourseBuilder'))
// ...

const TeacherQuestionBank = lazy(() => import('@/pages/teacher/QuestionBank'))
const TeacherExams = lazy(() => import('@/pages/teacher/Exams'))
const TeacherViewExam = lazy(() => import('@/pages/teacher/ViewExam'))
const TeacherEditExam = lazy(() => import('@/pages/teacher/EditExam'))
const TeacherHomeworks = lazy(() => import('@/pages/teacher/Homeworks'))
const MyStudents = lazy(() => import('@/pages/teacher/MyStudents'))
const PlatformSubscriptions = lazy(() => import('@/pages/teacher/PlatformSubscriptions'))
const CreateSubscription = lazy(() => import('@/pages/teacher/CreateSubscription'))
const StudentSubscriptions = lazy(() => import('@/pages/teacher/StudentSubscriptions'))
const AdminExams = lazy(() => import('@/pages/admin/Exams'))
const AdminViewExam = lazy(() => import('@/pages/admin/ExamDetails'))
const AdminEditExam = lazy(() => import('@/pages/admin/ExamDetails'))
const AdminQuestionBank = lazy(() => import('@/pages/admin/QuestionBank'))
const AdminHomeworks = lazy(() => import('@/pages/admin/Homeworks'))
const AdminFeatures = lazy(() => import('@/pages/admin/Features'))
const AdminSubscriptions = lazy(() => import('@/pages/admin/Subscriptions'))
const StudentHome = lazy(() => import('@/pages/student/Home'))
const StudentCourses = lazy(() => import('@/pages/student/Courses'))
const StudentSubscribe = lazy(() => import('@/pages/student/Subscribe'))
const StudentCourseDetails = lazy(() => import('@/features/student/components/CourseDetails'))
const StudentLessonPlayer = lazy(() => import('@/features/student/components/LessonPlayer'))
const StudentExams = lazy(() => import('@/pages/student/Exams'))
const StudentExamPlayer = lazy(() => import('@/pages/student/ExamPage'))
const StudentExamResults = lazy(() => import('@/pages/student/ExamResults'))
const StudentHomework = lazy(() => import('@/pages/student/Homework'))

const StudentProfile = lazy(() => import('@/pages/student/Profile'))

// Loading Fallback
const Loading = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>

// Unauthorized Page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">403</h1>
    <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
    <a href="/app" className="text-blue-600 hover:underline">Go to Dashboard</a>
  </div>
)

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (role === UserRole.ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  if (role === UserRole.TEACHER) {
    return <Navigate to="/teacher" replace />;
  }

  if (role === UserRole.STUDENT) {
    return <Navigate to="/student" replace />;
  }

  // Fallback to login if no role
  return <Navigate to="/login" replace />;
}

const PublicTeacherSiteRoutes = ({ subdomain }: { subdomain: string }) => {
  const [teacherConfig, setTeacherConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const { default: userService } = await import('@/features/user/userService');
        const response = await userService.getTeacherBySubdomain(subdomain);
        setTeacherConfig(response.data.teacher);
      } catch (err) {
        console.error("Failed to load teacher site:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [subdomain]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-600 mb-8">Academy not found or unavailable.</p>
        <a href="/" className="text-blue-600 hover:underline">Return to Edrak</a>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<TeacherSite config={teacherConfig} />} />
      <Route path="/course/:id" element={<div>Course Detail</div>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function AppRoutes({ subdomain }: { subdomain: string | null }) {
  // ROUTING LOGIC:
  // 1. null or 'www' -> Platform Landing
  // 2. 'app', 'student', 'teacher', 'admin' -> Main App Dashboard (Role based auth will handle inside)
  // 3. anything else -> Teacher Site

  if (!subdomain || subdomain === 'www') {
    return (
      <Routes>
        <Route path="/" element={<PlatformHome />} />

        {/* Public Routes - Cannot access when authenticated */}
        <Route path="/join" element={
          <PublicRoute>
            <TeacherRegistrationWizard />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignupSelection />
          </PublicRoute>
        } />
        <Route path="/signup/student" element={
          <PublicRoute>
            <StudentSignup />
          </PublicRoute>
        } />

        {/* Protected Routes - Role-based routing */}
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminHome />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:id" element={<AdminCourseDetails />} />
          <Route path="sections/:id" element={<AdminSectionDetails />} />
          <Route path="lessons/:id" element={<AdminLessonDetails />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="question-bank" element={<AdminQuestionBank />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="teachers/:id" element={<AdminTeacherDetails />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="students/:id" element={<AdminStudentDetails />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="exams/:id" element={<AdminViewExam />} />
          <Route path="exams/:id/edit" element={<AdminEditExam />} />
          <Route path="homeworks" element={<AdminHomeworks />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="activation-codes" element={<AdminActivationCodes />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="settings" element={<div>Admin Settings Page</div>} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<TeacherHome />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/sections" element={<CourseSections />} />
          <Route path="courses/sections/:sectionId" element={<CoursesList />} />
          <Route path="courses/:courseId/builder" element={<CourseBuilder />} />
          <Route path="lessons" element={<div>Teacher Lessons Page</div>} />
          <Route path="exams" element={<TeacherExams />} />
          <Route path="exams/:id" element={<TeacherViewExam />} />
          <Route path="exams/:id/edit" element={<TeacherEditExam />} />
          <Route path="homeworks" element={<TeacherHomeworks />} />
          <Route path="question-bank" element={<TeacherQuestionBank />} />
          <Route path="students" element={<MyStudents />} />
          <Route path="student-subscriptions" element={<StudentSubscriptions />} />
          <Route path="platform-subscriptions" element={<PlatformSubscriptions />} />
          <Route path="create-subscription" element={<CreateSubscription />} />
          <Route path="activation-codes" element={<TeacherActivationCodes />} />
          <Route path="coupons" element={<TeacherCoupons />} />
          <Route path="transactions" element={<div>Teacher Transactions Page</div>} />
          <Route path="reports" element={<div>Teacher Reports Page</div>} />
          <Route path="settings" element={<div>Teacher Settings Page</div>} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentHome />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:courseId" element={<StudentCourseDetails />} />
          <Route path="courses/:courseId/subscribe" element={<StudentSubscribe />} />
          <Route path="courses/:courseId/learn" element={<StudentLessonPlayer />} />
          <Route path="exams" element={<StudentExams />} />
          <Route path="exams/:examId/start" element={<StudentExamPlayer />} />
          <Route path="exams/:examId/results" element={<StudentExamResults />} />
          <Route path="homework" element={<StudentHomework />} />
          <Route path="subscriptions" element={<StudentSubscriptions />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="lessons" element={<div>Student Lessons Page</div>} />
          <Route path="settings" element={<div>Student Settings Page</div>} />
        </Route>

        {/* Legacy /app route - redirects based on role */}
        <Route path="/app" element={
          <ProtectedRoute>
            <RoleBasedRedirect />
          </ProtectedRoute>
        } />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }

  if (['app', 'student', 'teacher', 'admin'].includes(subdomain)) {
    return (
      <Routes>
        {/* Legacy route - redirects based on role */}
        <Route path="/" element={
          <ProtectedRoute>
            <RoleBasedRedirect />
          </ProtectedRoute>
        } />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    )
  }

  // Teacher Site (Public)
  return <PublicTeacherSiteRoutes subdomain={subdomain} />;
}

function App() {
  const subdomain = useSubdomain();

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <AppRoutes subdomain={subdomain} />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
