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
const TeacherHome = lazy(() => import('@/pages/teacher/Home'))
// const TeacherCourses = lazy(() => import('@/pages/teacher/Courses'))
const CourseSections = lazy(() => import('@/pages/teacher/courses/CourseSections'))
const CoursesList = lazy(() => import('@/pages/teacher/courses/CoursesList'))
const TeacherQuestionBank = lazy(() => import('@/pages/teacher/QuestionBank'))
const StudentHome = lazy(() => import('@/pages/student/Home'))
const StudentCourses = lazy(() => import('@/pages/student/Courses'))

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
          <Route path="teachers" element={<div>Admin Teachers Page</div>} />
          <Route path="students" element={<div>Admin Students Page</div>} />
          <Route path="settings" element={<div>Admin Settings Page</div>} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<TeacherHome />} />
          <Route path="courses" element={<CourseSections />} />
          <Route path="courses/sections/:sectionId" element={<CoursesList />} />
          <Route path="courses/:courseId/builder" element={<div>Course Builder (TODO)</div>} />
          <Route path="lessons" element={<div>Teacher Lessons Page</div>} />
          <Route path="exams" element={<div>Teacher Exams Page</div>} />
          <Route path="question-bank" element={<TeacherQuestionBank />} />
          <Route path="students" element={<div>Teacher Students Page</div>} />
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
          <Route path="lessons" element={<div>Student Lessons Page</div>} />
          <Route path="exams" element={<div>Student Exams Page</div>} />
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
