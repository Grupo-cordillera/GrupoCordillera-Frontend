# Ejemplos de Uso de Componentes

## 📦 Atoms - Componentes Base

### Input
```tsx
import { Input } from '@/components/atoms/Input/Input';

function MyForm() {
  return (
    <Input
      id="email"
      type="email"
      label="Correo Electrónico"
      placeholder="usuario@ejemplo.com"
      error="El correo es inválido"
    />
  );
}
```

### Button
```tsx
import { Button } from '@/components/atoms/Button/Button';

function MyComponent() {
  return (
    <>
      <Button variant="primary">Guardar</Button>
      <Button variant="secondary">Cancelar</Button>
      <Button variant="danger">Eliminar</Button>
      <Button size="large" fullWidth isLoading={true}>
        Cargando...
      </Button>
    </>
  );
}
```

### Alert
```tsx
import { Alert } from '@/components/atoms/Alert/Alert';

function MyComponent() {
  const [showError, setShowError] = React.useState(false);

  return (
    <>
      {showError && (
        <Alert
          type="error"
          message="Error al guardar los cambios"
          onClose={() => setShowError(false)}
        />
      )}
      <Alert type="success" message="Cambios guardados correctamente" />
      <Alert type="warning" message="Advertencia: Esta acción no se puede deshacer" />
      <Alert type="info" message="Información: Tu sesión expirará en 5 minutos" />
    </>
  );
}
```

### Logo
```tsx
import { Logo } from '@/components/atoms/Logo/Logo';

function Header() {
  return (
    <header>
      <Logo size="medium" />
      <Logo size="small" />
      <Logo size="large" />
    </header>
  );
}
```

## 🧬 Molecules - Componentes Compuestos

### Card
```tsx
import { Card } from '@/components/molecules/Card/Card';

function MyPage() {
  return (
    <Card shadow="large" className="custom-class">
      <h2>Contenido dentro de la Card</h2>
      <p>Las cards son útiles para agrupar contenido relacionado</p>
    </Card>
  );
}
```

### LoginForm
```tsx
import { LoginForm } from '@/components/molecules/LoginForm/LoginForm';
import { LoginRequest } from '@/types/auth';

function LoginPage() {
  const handleSubmit = async (data: LoginRequest) => {
    console.log('Datos de login:', data);
    // Llamar a tu servicio de autenticación
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isLoading={false}
      error={null}
    />
  );
}
```

## 📄 Pages - Páginas Completas

### LoginPage
```tsx
import { LoginPage } from '@/components/pages/Login/LoginPage';

// Usar en Router:
<Route path="/login" element={<LoginPage />} />
```

### DashboardPage (Protegida)
```tsx
import { DashboardPage } from '@/components/pages/Dashboard/DashboardPage';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';

// Usar en Router:
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

## 🔐 Hooks Personalizados

### useAuth - Acceder al contexto de autenticación
```tsx
import { useAuth } from '@/context/AuthContext';

function UserInfo() {
  const { user, token, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>No hay usuario autenticado</p>;
  }

  return (
    <div>
      <p>Bienvenido, {user?.nombre}</p>
      <p>Email: {user?.correo}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### useLogin - Hook para login
```tsx
import { useLogin } from '@/hooks/useLogin';
import { useNavigate } from 'react-router-dom';

function LoginComponent() {
  const { login, error, isLoading } = useLogin();
  const navigate = useNavigate();

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin({ username: 'user', password: 'pass' });
    }}>
      {error && <p>{error}</p>}
      {isLoading && <p>Cargando...</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

## 🛠️ Servicios API

### authService - Llamadas a API
```tsx
import { authService } from '@/services/authService';

async function performLogin() {
  try {
    const response = await authService.login({
      username: 'usuario@ejemplo.com',
      password: 'contraseña123'
    });
    console.log('Token:', response.jwt);
    console.log('Usuario:', response.nombre);
  } catch (error) {
    console.error('Error de login:', error);
  }
}

async function performRegister() {
  try {
    const response = await authService.register({
      nombre: 'Juan',
      apellido: 'Pérez',
      correo: 'juan@ejemplo.com',
      contrasena: 'contraseña123',
      direccion: 'Calle Principal 123',
      telefono: '+56912345678',
      numero_rol: 1
    });
    console.log('Usuario registrado:', response);
  } catch (error) {
    console.error('Error de registro:', error);
  }
}
```

## 📐 Variaciones de Componentes

### Input - Estados
```tsx
// Normal
<Input type="text" placeholder="Normal" />

// Con error
<Input error="Campo requerido" placeholder="Con error" />

// Deshabilitado
<Input disabled placeholder="Deshabilitado" />

// Con label
<Input label="Nombre" placeholder="Tu nombre" />
```

### Button - Variaciones
```tsx
// Variantes
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>

// Tamaños
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// Estados
<Button isLoading={true}>Loading...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>
```

### Card - Sombras
```tsx
<Card shadow="none">Sin sombra</Card>
<Card shadow="small">Sombra pequeña</Card>
<Card shadow="medium">Sombra media</Card>
<Card shadow="large">Sombra grande</Card>
```

## 🎨 Estilos CSS

### Variables de Color
```css
/* En tu componente personalizado */
.my-component {
  color: var(--color-primary);
  background-color: var(--color-gray-50);
  border: 2px solid var(--color-primary-light);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
}
```

### Variables de Espaciado
```
--spacing-xs:   0.25rem   (4px)
--spacing-sm:   0.5rem    (8px)
--spacing-md:   1rem      (16px)
--spacing-lg:   1.5rem    (24px)
--spacing-xl:   2rem      (32px)
--spacing-2xl:  3rem      (48px)
```

## 🚀 Composición de Componentes

Crear un formulario personalizado combinando atoms:

```tsx
import { Input } from '@/components/atoms/Input/Input';
import { Button } from '@/components/atoms/Button/Button';
import { Card } from '@/components/molecules/Card/Card';

function UserForm() {
  const [formData, setFormData] = React.useState({
    nombre: '',
    email: '',
  });

  return (
    <Card shadow="large">
      <h2>Formulario de Usuario</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <Input
          label="Nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Button type="submit" variant="primary" fullWidth>
          Guardar
        </Button>
      </form>
    </Card>
  );
}
```

## ✨ Tips

1. **Reutiliza componentes**: Los atoms están diseñados para combinarse
2. **Usa TypeScript**: Todos los componentes tienen tipos completamente tipados
3. **Estilos consistentes**: Usa variables CSS para mantener consistencia
4. **Validación**: React Hook Form ya está configurado en LoginForm
5. **Accesibilidad**: Todos los componentes tienen labels y aria attributes

