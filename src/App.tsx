import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSubdomain } from '@/hooks/useSubdomain'

// Lazy load pages
const PlatformHome = lazy(() => import('@/pages/platform/Home'))
const Dashboard = lazy(() => import('@/pages/app/Dashboard'))
const TeacherSite = lazy(() => import('@/pages/sites/TeacherSite'))
const TeacherRegistrationWizard = lazy(() => import('@/features/on-boarding'))
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'))

// Loading Fallback
const Loading = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>

const PublicTeacherSiteRoutes = ({ subdomain }: { subdomain: string }) => {
  const [teacherConfig, setTeacherConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        // We need to import userApi dynamically or move this logic to a separate component to avoid circular deps if any
        const { userApi } = await import('@/api/client');
        const data = await userApi.getPublicTeacherProfile(subdomain);
        setTeacherConfig(data.teacher);
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
        <Route path="/join" element={<TeacherRegistrationWizard />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/signup" element={<div>Signup Page</div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    )
  }

  if (['app', 'student', 'teacher', 'admin'].includes(subdomain)) {
     // Determine role from subdomain or auth context later.
     // For now, mapping subdomain to role for demo.
     const role = subdomain === 'admin' ? 'admin' : subdomain === 'student' ? 'student' : 'teacher';
     
     return (
        <Routes>
            <Route element={<DashboardLayout role={role as any} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/courses" element={<div>Courses Page</div>} />
                <Route path="/students" element={<div>Students Page</div>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
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
      <Suspense fallback={<Loading />}>
        <AppRoutes subdomain={subdomain} />
      </Suspense>
    </BrowserRouter>
  )
}

export default App
