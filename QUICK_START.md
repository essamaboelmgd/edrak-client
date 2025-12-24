# Quick Start Guide - Authentication System

## Installation

1. **Install dependencies** (already done):
```bash
npm install js-cookie
npm install --save-dev @types/js-cookie
```

2. **Create `.env` file**:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## File Structure

```
edrak-client/src/
├── lib/
│   └── axios.ts                    # Axios configuration & token management
├── types/
│   ├── auth.types.ts               # Auth-related TypeScript types
│   └── user.types.ts               # User-related TypeScript types
├── features/
│   ├── auth/
│   │   └── authService.ts          # Authentication service (OOP)
│   └── user/
│       └── userService.ts          # User service (OOP)
├── contexts/
│   └── AuthContext.tsx             # Auth state management
├── components/
│   └── ProtectedRoute.tsx          # Route protection components
└── App.tsx                         # Updated with AuthProvider
```

## Usage

### 1. Login
```typescript
// In your login component
import { useAuth } from '@/contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({
        mobileNumber: '01012345678',
        password: 'password123'
      });
      // Automatically redirects to /app
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### 2. Access User Data
```typescript
import { useAuth } from '@/contexts/AuthContext';

function Dashboard() {
  const { user, role, isAuthenticated } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
      <p>Role: {role}</p>
    </div>
  );
}
```

### 3. Logout
```typescript
import { useAuth } from '@/contexts/AuthContext';

function Header() {
  const { logout } = useAuth();
  
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

### 4. Protected Routes
```typescript
// In App.tsx or routing file
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';
import { UserRole } from '@/contexts/AuthContext';

// Protected route (requires authentication)
<Route path="/app" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Role-based protection
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
    <AdminPanel />
  </ProtectedRoute>
} />

// Public route (cannot access when authenticated)
<Route path="/login" element={
  <PublicRoute>
    <LoginPage />
  </PublicRoute>
} />
```

### 5. Make API Calls
```typescript
import userService from '@/features/user/userService';

// Get current user
const response = await userService.getMe();
console.log(response.data.user);

// Get teachers with pagination
const teachers = await userService.getAllTeachers({
  page: 1,
  limit: 10,
  search: 'ahmed'
});

// Get students (teacher/admin only)
const students = await userService.getAllStudents({
  page: 1,
  limit: 20,
  educationalLevel: '507f1f77bcf86cd799439011'
});
```

### 6. Teacher Registration
```typescript
import authService from '@/features/auth/authService';

const registerTeacher = async () => {
  try {
    await authService.signupTeacher({
      firstName: 'أحمد',
      middleName: 'محمد',
      lastName: 'علي',
      email: 'ahmed@example.com',
      password: 'password123',
      mobileNumber: '01012345678',
      gender: 'male',
      governorate: 'القاهرة',
      subdomain: 'ahmed-academy',
      platformSettings: {
        platformName: 'أكاديمية أحمد',
        theme: 'theme1',
        primaryColor: '#2563eb',
        secondaryColor: '#8B5CF6'
      }
    });
    // Redirects to login
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

## Key Concepts

### 1. Token Management
- **Automatic**: Tokens are automatically stored in cookies and sent with every request
- **No manual handling**: You don't need to manage tokens manually
- **Secure**: Uses httpOnly cookies in production

### 2. Authentication Flow
```
1. User logs in → Token stored in cookie
2. User navigates to /app → ProtectedRoute checks auth
3. If authenticated → Render page
4. If not authenticated → Redirect to /login
5. On token expiration → Auto logout & redirect
```

### 3. Role-Based Access
```typescript
// Three user roles
UserRole.ADMIN    // Full access
UserRole.TEACHER  // Teacher dashboard & students
UserRole.STUDENT  // Student dashboard & courses
```

### 4. Context Usage
```typescript
const {
  user,              // Current user object
  role,              // User role (admin/teacher/student)
  isAuthenticated,   // Boolean: is user logged in?
  isLoading,         // Boolean: is auth check in progress?
  login,             // Function: login user
  logout,            // Function: logout user
  refreshUser        // Function: refresh user data
} = useAuth();
```

## Common Patterns

### Check if user is teacher
```typescript
const { role } = useAuth();
const isTeacher = role === UserRole.TEACHER;
```

### Conditional rendering based on auth
```typescript
const { isAuthenticated } = useAuth();

return (
  <div>
    {isAuthenticated ? (
      <Dashboard />
    ) : (
      <LandingPage />
    )}
  </div>
);
```

### Handle API errors
```typescript
try {
  const response = await userService.getMe();
  setUser(response.data.user);
} catch (error: any) {
  if (error.response?.status === 401) {
    // Token expired - user will be auto-logged out
  } else if (error.response?.status === 403) {
    // Forbidden - no permission
  } else {
    // Other error
    console.error(error.response?.data?.message);
  }
}
```

## Testing

### Test Login
1. Start backend server: `npm run dev` (in Blog App folder)
2. Start frontend: `npm run dev` (in edrak-client folder)
3. Navigate to `http://localhost:5173/login`
4. Enter credentials and login
5. Should redirect to `/app` with user data

### Test Protected Routes
1. Without logging in, try to access `http://localhost:5173/app`
2. Should redirect to `/login`
3. After login, try to access `/login`
4. Should redirect to `/app`

### Test Token Expiration
1. Login successfully
2. Manually delete token cookie from browser
3. Try to access protected route
4. Should redirect to login

## Troubleshooting

### "Cannot find module '@/contexts/AuthContext'"
- Check your `tsconfig.json` has the `@` path alias configured
- Restart your dev server

### "Network Error" on API calls
- Verify backend is running on `http://localhost:3000`
- Check `.env` file has correct `VITE_API_BASE_URL`
- Check CORS settings on backend

### Token not persisting
- Check browser console for cookie errors
- Verify `js-cookie` is installed
- Check cookie settings in axios.ts

### Infinite redirect loop
- Check your route configuration
- Verify ProtectedRoute and PublicRoute logic
- Check browser console for errors

## Next Steps

1. ✅ Authentication system is complete
2. 📝 Implement student signup page
3. 🎨 Customize login/signup UI
4. 🔐 Add password reset functionality
5. 📧 Add email verification
6. 🔄 Implement refresh token system
7. 📱 Add mobile-responsive design
8. 🧪 Write tests for auth flow

## Support

For detailed documentation, see `AUTH_IMPLEMENTATION.md`
For backend API reference, see `Blog App/API_DOCUMENTATION.md`

