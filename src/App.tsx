import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSubdomain } from '@/hooks/useSubdomain'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute'

// Lazy load pages
const PlatformHome = lazy(() => import('@/pages/platform/Home'))
const Dashboard = lazy(() => import('@/pages/app/Dashboard'))
const TeacherSite = lazy(() => import('@/pages/sites/TeacherSite'))
const TeacherRegistrationWizard = lazy(() => import('@/features/on-boarding'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignupSelection = lazy(() => import('@/pages/auth/SignupSelection'))
const StudentSignup = lazy(() => import('@/pages/auth/StudentSignup'))
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'))

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

        {/* Protected Routes - Require authentication */}
        <Route path="/app" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="teachers" element={<div>Teachers Page</div>} />
          <Route path="students" element={<div>Students Page</div>} />
        </Route>

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }

  if (['app', 'student', 'teacher', 'admin'].includes(subdomain)) {
    return (
      <Routes>
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teachers" element={<div>Teachers Page</div>} />
          <Route path="/students" element={<div>Students Page</div>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>

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
