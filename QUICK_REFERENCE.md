# Quick Reference Guide - Frontend Implementation

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
Create `.env.local`:
```bash
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
VITE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 File Structure Quick Reference

### Core Files
- `AppRouter.tsx` - Main routing and layout
- `App.tsx` - Original app (used in /workflow route)
- `main.tsx` - Entry point

### Key Directories

**Components** (`src/components/`)
- `ErrorBoundary.tsx` - Error handling wrapper
- `LoadingSpinner.tsx` - Loading state
- `ErrorAlert.tsx` - Error messages
- `SuccessAlert.tsx` - Success messages

**Contexts** (`src/contexts/`)
- `AuthContext.tsx` - Authentication state
- `NotificationContext.tsx` - Toast notifications

**Hooks** (`src/hooks/`)
- `useAuth.ts` - Get auth state
- `useNotification.ts` - Show notifications
- `useFormValidation.ts` - Form validation
- `useStorage.ts` - Local storage

**Services** (`src/services/`)
- `APIClient.ts` - HTTP client (use this for API calls)
- `projectAPI.ts` - Projects endpoints
- `pipelineAPI.ts` - Pipeline endpoints
- `monitoringAPI.ts` - Monitoring endpoints
- `cicdAPI.ts` - CI/CD endpoints
- `integrationAPI.ts` - Integration endpoints

**Pages** (`src/pages/`)
- `Login.tsx` - Login page
- `Dashboard.tsx` - Main dashboard
- `Projects.tsx` - Project management
- `PipelineDAG.tsx` - Pipeline visualization
- `Monitoring.tsx` - Monitoring dashboard
- `CICD.tsx` - CI/CD pipelines
- `Integrations.tsx` - AWS integrations
- `Admin.tsx` - Admin panel

**Utils** (`src/utils/`)
- `FormValidator.ts` - Input validation
- `ValidationRules.ts` - Validation rules
- `errorHandler.ts` - Error utilities
- `StorageManager.ts` - Storage utilities
- `constants.ts` - Constants

---

## 🔐 Authentication Usage

### Check if User is Logged In
```typescript
const { isAuthenticated, user } = useAuth();

if (!isAuthenticated) {
  // Show login
}
```

### Logout User
```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  // Redirected to login automatically
};
```

### Access User Info
```typescript
const { user } = useAuth();

console.log(user.name);      // User's name
console.log(user.email);     // User's email
console.log(user.role);      // User's role (admin, editor, viewer)
```

---

## 📡 Making API Calls

### Method 1: Using Service Functions (Recommended)
```typescript
import { projectAPI } from '../services/projectAPI';
import { useNotification } from '../hooks/useNotification';

const MyComponent = () => {
  const { showNotification } = useNotification();

  const handleCreateProject = async (formData) => {
    try {
      const result = await projectAPI.createProject(formData);
      showNotification('Project created!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    // JSX
  );
};
```

### Method 2: Using APIClient Directly
```typescript
import { APIClient } from '../services/APIClient';

const result = await APIClient.apiPost('/projects', {
  name: 'My Project',
  description: 'Test'
});
```

### Method 3: Custom Hook for Async Data
```typescript
const { data, loading, error } = useAsync(
  () => projectAPI.getProjects(),
  []
);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorAlert error={error} />;

return <div>{data.map(/* ... */)}</div>;
```

---

## ✅ Form Validation Usage

### Basic Form with Validation
```typescript
import { useFormValidation } from '../hooks/useFormValidation';
import { ValidationRules } from '../utils/ValidationRules';

const MyForm = () => {
  const { values, errors, handleChange, handleSubmit } = useFormValidation(
    { email: '', password: '' },
    {
      email: ValidationRules.email(),
      password: ValidationRules.minLength(8)
    },
    async (values) => {
      // Submit handler
      await projectAPI.createProject(values);
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Available Validation Rules
```typescript
ValidationRules.required()           // Required field
ValidationRules.email()              // Valid email
ValidationRules.minLength(8)         // Min length
ValidationRules.maxLength(50)        // Max length
ValidationRules.password()           // Strong password
ValidationRules.url()                // Valid URL
ValidationRules.alphanumeric()       // Letters and numbers only
ValidationRules.custom(fn)           // Custom rule
```

---

## 🔔 Notifications Usage

### Show Success Message
```typescript
import { useNotification } from '../hooks/useNotification';

const MyComponent = () => {
  const { showNotification } = useNotification();

  const handleSuccess = () => {
    showNotification('Operation successful!', 'success');
  };

  return <button onClick={handleSuccess}>Click me</button>;
};
```

### Show Error Message
```typescript
const { showNotification } = useNotification();

showNotification('Something went wrong', 'error');
```

### Show Info Message
```typescript
showNotification('This is an info message', 'info');
```

### Show Warning
```typescript
showNotification('Are you sure?', 'warning');
```

---

## ⚠️ Error Handling

### Try-Catch Pattern
```typescript
try {
  const result = await projectAPI.getProjects();
  setProjects(result);
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 404) {
    // Handle not found
  } else {
    // Handle other errors
    console.error('Error:', error);
  }
}
```

### Error Boundary Wrapping
All critical sections are already wrapped in `<ErrorBoundary>` in AppRouter.tsx. For additional safety:

```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

## 📊 Available API Endpoints

### Projects
```
GET    /api/projects              → Get all projects
POST   /api/projects              → Create project
GET    /api/projects/:id          → Get project details
PUT    /api/projects/:id          → Update project
DELETE /api/projects/:id          → Delete project
```

### Pipelines
```
GET    /api/pipelines             → Get all pipelines
POST   /api/pipelines             → Create pipeline
GET    /api/pipelines/:id         → Get pipeline details
PUT    /api/pipelines/:id         → Update pipeline
DELETE /api/pipelines/:id         → Delete pipeline
POST   /api/pipelines/:id/execute → Execute pipeline
```

### Monitoring
```
GET    /api/metrics               → Get system metrics
GET    /api/alerts                → Get alerts
POST   /api/alerts                → Create alert
PUT    /api/alerts/:id            → Update alert
DELETE /api/alerts/:id            → Delete alert
```

### CI/CD
```
GET    /api/deployments           → Get deployments
POST   /api/deployments           → Create deployment
GET    /api/deployments/:id/logs  → Get deployment logs
POST   /api/deployments/:id/rollback → Rollback
```

### Integrations
```
GET    /api/integrations          → Get integrations
POST   /api/integrations/test     → Test connection
PUT    /api/integrations/:id      → Update integration
```

### Authentication
```
POST   /api/auth/login            → Login
POST   /api/auth/logout           → Logout
POST   /api/auth/refresh          → Refresh token
```

---

## 🎨 Common UI Patterns

### Loading State
```typescript
import { LoadingSpinner } from '../components/LoadingSpinner';

{isLoading ? <LoadingSpinner /> : <Content />}
```

### Error State with Retry
```typescript
import { ErrorAlert } from '../components/ErrorAlert';

{error ? (
  <ErrorAlert 
    error={error} 
    onRetry={() => refetch()}
  />
) : (
  <Content />
)}
```

### Success Message
```typescript
import { SuccessAlert } from '../components/SuccessAlert';

{successMessage && <SuccessAlert message={successMessage} />}
```

---

## 🐛 Debugging Tips

### Check Console Errors
Press F12 to open developer tools and check the Console tab for errors.

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action
4. Check the network requests and responses

### Check Local Storage
1. DevTools > Application tab
2. Look at Local Storage
3. Verify tokens are being saved

### Check Auth State
Add this to any component:
```typescript
const { user, isAuthenticated } = useAuth();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);
```

---

## 📝 Common Issues & Solutions

### Issue: "Cannot find module" Error
**Solution**: Check import paths match your file structure. Use relative paths starting with `./` or `../`.

### Issue: API Calls Not Working
**Checklist**:
- [ ] Backend server is running
- [ ] `VITE_API_URL` is correct in `.env.local`
- [ ] Check browser console for errors
- [ ] Check Network tab to see actual requests

### Issue: Login Not Working
**Checklist**:
- [ ] Backend `/api/auth/login` endpoint is working
- [ ] Credentials are correct
- [ ] Check Network tab to see login response

### Issue: Protected Routes Redirect to Login
**Solution**: This is expected if not authenticated. Login first.

---

## 🚀 Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Output in `dist/` folder.

### Preview Build
```bash
npm run preview
```

---

## 📚 Additional Resources

- React Router: https://reactrouter.com/
- React Hooks: https://react.dev/reference/react
- Tailwind CSS: https://tailwindcss.com/
- Axios: https://axios-http.com/

---

## ✨ Tips for Using the App

1. **Always use the service functions** from `src/services/` - they handle auth tokens automatically
2. **Wrap async operations in try-catch** - always handle potential errors
3. **Use the useNotification hook** to show user feedback
4. **Use the ErrorBoundary** for component error handling
5. **Check authentication** before accessing protected routes

---

**Version**: 1.0.0
**Last Updated**: January 2025
