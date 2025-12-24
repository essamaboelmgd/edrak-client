# Authentication System Implementation

## Overview
This document describes the complete authentication system implementation for the Edrak client application.

## Architecture

### 1. Axios Configuration (`src/lib/axios.ts`)
- **Singleton Pattern**: Single axios instance used throughout the app
- **Token Management**: Automatic token injection via request interceptors
- **Cookie Storage**: Uses `js-cookie` for secure token storage
- **Error Handling**: Global error interceptor for 401/403 responses
- **Auto-redirect**: Automatically redirects to login on authentication failure

#### Key Features:
```typescript
- apiClient.setToken(token)     // Store token in cookie
- apiClient.getToken()           // Retrieve token from cookie
- apiClient.clearToken()         // Remove token
- apiClient.hasToken()           // Check if token exists
```

### 2. Service Layer (OOP Pattern)

#### Auth Service (`src/features/auth/authService.ts`)
Handles all authentication operations:
- `signupStudent(data)` - Student registration
- `signupTeacher(data)` - Teacher registration
- `login(credentials)` - User login

#### User Service (`src/features/user/userService.ts`)
Handles user-related operations:
- `getMe()` - Get current authenticated user
- `getAllTeachers(query)` - Get teachers list with pagination
- `getTeacherById(id)` - Get teacher details
- `getAllStudents(query)` - Get students list (Admin/Teacher only)
- `getStudentById(id)` - Get student details
- `getMyStudents(query)` - Get teacher's students
- `getTeacherBySubdomain(subdomain)` - Public teacher profile

### 3. Type System (`src/types/`)

#### auth.types.ts
- Login/Signup interfaces
- User response types (Student, Teacher, Admin)
- API response wrappers

#### user.types.ts
- Teacher public/admin views
- Student list/detail views
- Pagination interfaces
- Query parameter types

### 4. Authentication Context (`src/contexts/AuthContext.tsx`)

#### State Management:
```typescript
{
  user: IUserResponse | IStudentResponse | ITeacherResponse | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

#### Methods:
- `login(credentials)` - Login and store token
- `signupStudent(data)` - Register student
- `signupTeacher(data)` - Register teacher
- `logout()` - Clear token and redirect
- `refreshUser()` - Refresh user data

#### Features:
- Automatic authentication check on mount
- Calls `/me` endpoint to verify token
- Stores user data and role in state
- Handles token expiration gracefully

### 5. Route Protection

#### ProtectedRoute Component
```typescript
<ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
  <TeacherDashboard />
</ProtectedRoute>
```

Features:
- Requires authentication
- Optional role-based access control
- Redirects to login if not authenticated
- Shows loading state during auth check

#### PublicRoute Component
```typescript
<PublicRoute>
  <LoginPage />
</PublicRoute>
```

Features:
- Prevents authenticated users from accessing
- Redirects to dashboard if already logged in
- Used for login/register pages

## Implementation Flow

### 1. Application Startup
```
App.tsx
  └─> BrowserRouter
      └─> AuthProvider (wraps entire app)
          └─> Checks for token in cookies
          └─> If token exists, calls /me endpoint
          └─> Sets user and role in context
          └─> Routes render based on auth state
```

### 2. Login Flow
```
User enters credentials
  └─> LoginPage calls useAuth().login()
      └─> AuthContext.login() calls authService.login()
          └─> authService makes API call to /auth/login
          └─> Receives token and user data
          └─> apiClient.setToken() stores token in cookie
          └─> Sets user and role in context
          └─> Navigates to /app
```

### 3. Protected Route Access
```
User navigates to /app
  └─> ProtectedRoute checks isAuthenticated
      └─> If not authenticated → redirect to /login
      └─> If authenticated but wrong role → redirect to /unauthorized
      └─> If authorized → render children
```

### 4. Token Expiration
```
API call returns 401/403
  └─> Axios interceptor catches error
      └─> apiClient.clearToken() removes token
      └─> Redirects to /login
      └─> User must login again
```

## Usage Examples

### 1. Using Auth Context in Components
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, role, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.firstName}</p>
      <p>Role: {role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Making Authenticated API Calls
```typescript
import userService from '@/features/user/userService';

async function fetchTeachers() {
  try {
    const response = await userService.getAllTeachers({
      page: 1,
      limit: 10,
      search: 'ahmed'
    });
    console.log(response.data.teachers);
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
  }
}
```

### 3. Protected Routes
```typescript
// In App.tsx or routing configuration
<Route path="/app" element={
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
}>
  <Route index element={<Dashboard />} />
</Route>

// Role-based protection
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
    <AdminPanel />
  </ProtectedRoute>
} />
```

### 4. Public Routes
```typescript
<Route path="/login" element={
  <PublicRoute>
    <LoginPage />
  </PublicRoute>
} />
```

## Security Features

1. **Cookie-based Token Storage**
   - More secure than localStorage
   - HttpOnly option in production
   - SameSite protection

2. **Automatic Token Injection**
   - No manual token management needed
   - Consistent across all API calls

3. **Token Expiration Handling**
   - Automatic logout on 401/403
   - Clear token on error
   - Redirect to login

4. **Role-based Access Control**
   - Granular permission system
   - Route-level protection
   - Component-level checks

## Environment Variables

Create a `.env` file in the root:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENV=development
```

## API Endpoints Used

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup/student` - Student registration
- `POST /auth/signup/teacher` - Teacher registration

### User
- `GET /users/me` - Get current user
- `GET /users/teachers` - Get all teachers
- `GET /users/teachers/:id` - Get teacher by ID
- `GET /users/students` - Get all students
- `GET /users/students/:id` - Get student by ID
- `GET /users/my-students` - Get teacher's students
- `GET /users/public/:subdomain` - Get public teacher profile

## Migration from Old System

### Before:
```typescript
import { client } from '@/api/client';
import { authApi } from '@/api/auth';

// Manual token management
const token = localStorage.getItem('token');
client.defaults.headers.Authorization = `Bearer ${token}`;

// Direct API calls
const response = await authApi.registerTeacher(data);
```

### After:
```typescript
import authService from '@/features/auth/authService';
import { useAuth } from '@/contexts/AuthContext';

// Automatic token management
const { login } = useAuth();
await login(credentials);

// Service layer
const response = await authService.signupTeacher(data);
```

## Best Practices

1. **Always use AuthContext** for authentication state
2. **Use service layer** instead of direct axios calls
3. **Implement loading states** during auth checks
4. **Handle errors gracefully** with user-friendly messages
5. **Use TypeScript types** from `src/types/`
6. **Protect sensitive routes** with ProtectedRoute
7. **Test token expiration** scenarios

## Troubleshooting

### Token not persisting
- Check cookie settings in browser
- Verify `js-cookie` is installed
- Check cookie domain/path settings

### Infinite redirect loops
- Check ProtectedRoute and PublicRoute logic
- Verify auth check in AuthContext
- Check for circular dependencies

### API calls failing
- Verify API base URL in `.env`
- Check network tab for request details
- Verify token is being sent in headers

## Future Enhancements

1. **Refresh Token System**
   - Implement token refresh logic
   - Silent token renewal

2. **Remember Me**
   - Extended cookie expiration
   - Persistent sessions

3. **Social Login**
   - Google/Facebook integration
   - OAuth flow

4. **Two-Factor Authentication**
   - SMS/Email verification
   - TOTP support

5. **Session Management**
   - Multiple device tracking
   - Force logout from all devices

