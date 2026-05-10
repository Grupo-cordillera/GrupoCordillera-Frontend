# GrupoCordillera Frontend - Project Documentation

## Project Overview

Retail inventory management system frontend built with React + TypeScript using Atomic Design pattern.

## Architecture

### Atomic Design Structure
- **Atoms**: Base reusable components (Input, Button, Logo, Alert)
- **Molecules**: Compound components (Card, LoginForm)
- **Organisms**: Large components (future)
- **Pages**: Full-page components (LoginPage, DashboardPage)

### State Management
- Context API for authentication state
- localStorage for persistent token storage
- Custom hooks for login logic

## File Organization

```
src/
├── components/
│   ├── atoms/              # UI building blocks
│   ├── molecules/          # Composite components
│   ├── pages/              # Full pages
│   └── ProtectedRoute/     # Auth wrapper
├── context/                # Context providers
├── hooks/                  # Custom React hooks
├── services/               # API clients
├── types/                  # TypeScript interfaces
├── styles/                 # CSS files
├── App.tsx                 # Router setup
└── main.tsx                # Entry point
```

## API Integration

- Backend URL: `http://localhost:8080`
- Configured via `VITE_API_URL` env variable
- Axios interceptor adds JWT to all requests
- Error handling through custom hooks

## Authentication Flow

1. User submits login form
2. `authService.login()` calls `/api/bff/auth/login`
3. JWT response stored in localStorage
4. User data stored in AuthContext
5. Protected routes check token validity

## Key Dependencies

- React 19
- TypeScript 5+
- React Router 6
- Axios
- React Hook Form

## Development Commands

```bash
npm install    # Install dependencies
npm run dev    # Start dev server (port 5173)
npm run build  # Production build
npm run preview # Preview production build
```

## Important Notes

1. CORS must be enabled on backend for localhost:5173
2. Token stored in localStorage as "authToken"
3. User data stored as "user" JSON in localStorage
4. All API calls include Authorization header with Bearer token
