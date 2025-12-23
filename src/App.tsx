import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSubdomain } from '@/hooks/useSubdomain'

// Lazy load pages
const PlatformHome = React.lazy(() => import('@/pages/platform/Home'))
const Dashboard = React.lazy(() => import('@/pages/app/Dashboard'))
const TeacherSite = React.lazy(() => import('@/pages/sites/TeacherSite'))
const TeacherRegistrationWizard = React.lazy(() => import('@/features/on-boarding'))
const DashboardLayout = React.lazy(() => import('@/components/layout/DashboardLayout'))

// Loading Fallback
const Loading = () => <div className="min-h-screen flex items-center justify-center">Loading...</div>

function AppRoutes() {
  const subdomain = useSubdomain();

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
  return (
    <Routes>
        <Route path="/" element={<TeacherSite />} />
        <Route path="/course/:id" element={<div>Course Detail</div>} />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<Loading />}>
        <AppRoutes />
      </React.Suspense>
    </BrowserRouter>
  )
}

export default App
