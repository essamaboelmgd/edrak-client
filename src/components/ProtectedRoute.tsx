import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireAuth?: boolean;
}

/**
 * ProtectedRoute component
 * - Protects routes that require authentication
 * - Can restrict access based on user roles
 * - Redirects to login if not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requireAuth = true
}) => {
    const { isAuthenticated, isLoading, role } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If route requires authentication and user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If specific roles are required, check if user has the right role
    if (allowedRoles && allowedRoles.length > 0 && role) {
        if (!allowedRoles.includes(role)) {
            // Redirect to unauthorized page or home
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};

interface PublicRouteProps {
    children: React.ReactNode;
}

/**
 * PublicRoute component
 * - For routes like login/register that should not be accessible when authenticated
 * - Redirects to dashboard if already authenticated
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If user is authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/app" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

