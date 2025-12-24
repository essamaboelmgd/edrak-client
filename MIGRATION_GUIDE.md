# Migration Guide - From Old to New Auth System

## Overview
This guide helps you migrate from the old authentication system to the new one.

## Key Changes

### 1. Token Storage
**Before:** localStorage
```typescript
localStorage.setItem('token', token);
const token = localStorage.getItem('token');
localStorage.removeItem('token');
```

**After:** Cookies (automatic)
```typescript
// Token management is automatic!
// No need to manually store/retrieve tokens
```

### 2. API Client
**Before:** Direct axios instance
```typescript
import { client } from '@/api/client';

const response = await client.post('/auth/login', data);
const token = response.data.token;
localStorage.setItem('token', token);
```

**After:** Service layer
```typescript
import authService from '@/features/auth/authService';
import { useAuth } from '@/contexts/AuthContext';

const { login } = useAuth();
await login(credentials); // Token stored automatically
```

### 3. Authentication State
**Before:** Manual state management
```typescript
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);

// Manual checks
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // Fetch user data
  }
}, []);
```

**After:** AuthContext
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, role } = useAuth();
// State managed automatically
```

### 4. Protected Routes
**Before:** Manual checks in components
```typescript
function Dashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, []);
  
  return <div>Dashboard</div>;
}
```

**After:** ProtectedRoute component
```typescript
<Route path="/app" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### 5. API Calls
**Before:** Direct axios calls
```typescript
import { client } from '@/api/client';

const response = await client.get('/users/me');
const user = response.data.data.user;
```

**After:** Service layer
```typescript
import userService from '@/features/user/userService';

const response = await userService.getMe();
const user = response.data.user;
```

## Step-by-Step Migration

### Step 1: Update Imports

**Old:**
```typescript
import { client } from '@/api/client';
import { authApi } from '@/api/auth';
```

**New:**
```typescript
import authService from '@/features/auth/authService';
import userService from '@/features/user/userService';
import { useAuth } from '@/contexts/AuthContext';
```

### Step 2: Replace Login Logic

**Old:**
```typescript
const handleLogin = async (credentials) => {
  const response = await client.post('/auth/login', credentials);
  const token = response.data.data.token;
  localStorage.setItem('token', token);
  navigate('/app');
};
```

**New:**
```typescript
const { login } = useAuth();

const handleLogin = async (credentials) => {
  await login(credentials);
  // Navigation handled automatically
};
```

### Step 3: Replace Logout Logic

**Old:**
```typescript
const handleLogout = () => {
  localStorage.removeItem('token');
  navigate('/login');
};
```

**New:**
```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout(); // Clears token and navigates
};
```

### Step 4: Update User Data Access

**Old:**
```typescript
const [user, setUser] = useState(null);

useEffect(() => {
  const fetchUser = async () => {
    const response = await client.get('/users/me');
    setUser(response.data.data.user);
  };
  fetchUser();
}, []);
```

**New:**
```typescript
const { user } = useAuth();
// User data available immediately
```

### Step 5: Update Route Protection

**Old:**
```typescript
<Routes>
  <Route path="/app" element={<Dashboard />} />
  <Route path="/login" element={<LoginPage />} />
</Routes>

// Manual checks in Dashboard component
```

**New:**
```typescript
<Routes>
  <Route path="/app" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/login" element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  } />
</Routes>
```

### Step 6: Update API Service Calls

**Old:**
```typescript
const getTeachers = async () => {
  const response = await client.get('/users/teachers?page=1&limit=10');
  return response.data.data.teachers;
};
```

**New:**
```typescript
const getTeachers = async () => {
  const response = await userService.getAllTeachers({ page: 1, limit: 10 });
  return response.data.teachers;
};
```

## Component Migration Examples

### Example 1: Login Component

**Before:**
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ mobileNumber: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await client.post('/auth/login', credentials);
      const token = response.data.data.token;
      localStorage.setItem('token', token);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

**After:**
```typescript
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ mobileNumber: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      // Navigation handled automatically
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Example 2: Dashboard Component

**Before:**
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await client.get('/users/me');
        setUser(response.data.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
    </div>
  );
}
```

**After:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
    </div>
  );
}
```

### Example 3: Header Component with Logout

**Before:**
```typescript
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header>
      <button onClick={handleLogout}>Logout</button>
    </header>
  );
}
```

**After:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { logout, user } = useAuth();

  return (
    <header>
      <span>Welcome, {user?.firstName}</span>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
```

## Common Migration Patterns

### Pattern 1: Check if User is Authenticated

**Before:**
```typescript
const isAuthenticated = !!localStorage.getItem('token');
```

**After:**
```typescript
const { isAuthenticated } = useAuth();
```

### Pattern 2: Get Current User

**Before:**
```typescript
const [user, setUser] = useState(null);

useEffect(() => {
  const fetchUser = async () => {
    const response = await client.get('/users/me');
    setUser(response.data.data.user);
  };
  fetchUser();
}, []);
```

**After:**
```typescript
const { user } = useAuth();
```

### Pattern 3: Check User Role

**Before:**
```typescript
const [userRole, setUserRole] = useState(null);

useEffect(() => {
  const fetchUser = async () => {
    const response = await client.get('/users/me');
    setUserRole(response.data.data.user.role);
  };
  fetchUser();
}, []);

const isTeacher = userRole === 'teacher';
```

**After:**
```typescript
const { role } = useAuth();
const isTeacher = role === UserRole.TEACHER;
```

### Pattern 4: Conditional Rendering Based on Auth

**Before:**
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  const token = localStorage.getItem('token');
  setIsAuthenticated(!!token);
}, []);

return isAuthenticated ? <Dashboard /> : <Login />;
```

**After:**
```typescript
const { isAuthenticated } = useAuth();

return isAuthenticated ? <Dashboard /> : <Login />;
```

## Breaking Changes

### 1. Token Storage Location
- **Old:** localStorage
- **New:** Cookies
- **Action:** Remove all `localStorage.getItem('token')` calls

### 2. API Response Structure
- **Old:** `response.data.data.user`
- **New:** `response.data.user`
- **Action:** Update response parsing

### 3. Manual Token Management
- **Old:** Manual `setToken()` calls
- **New:** Automatic via AuthContext
- **Action:** Remove manual token management

### 4. Route Protection
- **Old:** Manual checks in components
- **New:** ProtectedRoute component
- **Action:** Wrap routes with ProtectedRoute

## Checklist

- [ ] Replace all `localStorage` token operations
- [ ] Update all API calls to use service layer
- [ ] Replace manual auth checks with `useAuth()`
- [ ] Wrap protected routes with `ProtectedRoute`
- [ ] Wrap public routes with `PublicRoute`
- [ ] Update login/logout logic
- [ ] Remove manual user state management
- [ ] Update imports to new services
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test protected routes
- [ ] Test token expiration

## Testing After Migration

1. **Login Flow**
   - Login with valid credentials
   - Verify token stored in cookies
   - Verify redirect to dashboard
   - Verify user data displayed

2. **Logout Flow**
   - Click logout button
   - Verify token removed from cookies
   - Verify redirect to login

3. **Protected Routes**
   - Try accessing /app without login
   - Verify redirect to login
   - Login and access /app
   - Verify access granted

4. **Token Expiration**
   - Login successfully
   - Delete token cookie manually
   - Try accessing protected route
   - Verify redirect to login

## Support

If you encounter issues during migration:
1. Check the console for errors
2. Verify imports are correct
3. Check AuthProvider is wrapping your app
4. Review QUICK_START.md for examples
5. Review AUTH_IMPLEMENTATION.md for details

