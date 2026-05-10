# GrupoCordillera - Frontend

Sistema profesional de gestión de inventario para empresas de retail con arquitectura Atomic Design.

## 🎯 Características Iniciales

- ✅ Login con autenticación JWT
- ✅ Protección de rutas
- ✅ Contexto de autenticación
- ✅ Diseño profesional para retail
- 📋 Panel de inventario (próximo)
- 📊 Panel de estadísticas (próximo)
- 👤 Perfil de usuario (próximo)

## 📋 Estructura del Proyecto

```
src/
├── components/
│   ├── atoms/              # Componentes base reutilizables
│   │   ├── Input
│   │   ├── Button
│   │   ├── Logo
│   │   └── Alert
│   ├── molecules/          # Componentes compuestos
│   │   ├── Card
│   │   └── LoginForm
│   ├── pages/              # Páginas completas
│   │   ├── Login
│   │   └── Dashboard
│   ├── ProtectedRoute
│   └── ...
├── context/                # Context API para estado global
│   └── AuthContext.tsx
├── hooks/                  # Hooks personalizados
│   └── useLogin.ts
├── services/               # Servicios API
│   └── authService.ts
├── types/                  # Tipos TypeScript
│   └── auth.ts
├── styles/                 # Estilos CSS
│   ├── components/
│   ├── pages/
│   └── global.css
├── App.tsx
└── main.tsx
```

## 🚀 Configuración Inicial

### Requisitos
- Node.js 16+
- npm o yarn

### Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Asegúrate que VITE_API_URL apunte a tu backend
VITE_API_URL=http://localhost:8080
```

### Desarrollo

```bash
# Inicia el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para producción

```bash
npm run build
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

1. El usuario inicia sesión con usuario/contraseña
2. El backend devuelve un JWT que se almacena en localStorage
3. El JWT se envía en cada request en el header `Authorization: Bearer <token>`
4. Las rutas protegidas verifican la existencia del token

## 📝 Endpoints API Utilizados

### Autenticación
- `POST /api/bff/auth/login` - Iniciar sesión
- `POST /api/bff/auth/register` - Registrarse (próximo)

### Ejemplo de Login Request
```json
{
  "username": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Ejemplo de Login Response
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIs...",
  "nombre": "Juan",
  "correo": "juan@ejemplo.com",
  "direccion": "Calle Principal 123",
  "telefono": "+56912345678",
  "rol": "ADMIN"
}
```

## 🎨 Atomic Design

Este proyecto sigue el patrón Atomic Design:

- **Atoms**: Componentes base (`Button`, `Input`, `Logo`, `Alert`)
- **Molecules**: Componentes compuestos (`Card`, `LoginForm`)
- **Organisms**: Componentes grandes (próximamente)
- **Templates**: Layouts (próximamente)
- **Pages**: Páginas completas (`LoginPage`, `DashboardPage`)

## 🛠️ Herramientas y Dependencias

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Vite** - Build tool

## 📝 Notas Importantes

1. **CORS**: Asegúrate que tu backend esté configurado para aceptar requests desde `http://localhost:5173`
2. **Token Expiration**: El frontend no maneja la expiración de tokens automáticamente (implementar próximamente)
3. **Error Handling**: Los errores de API se muestran al usuario mediante alerts

## 🚦 Próximos Pasos

1. Panel de Inventario
   - Listado de productos
   - CRUD de productos
   - Gestión de stock

2. Panel de Estadísticas
   - Gráficos de ventas
   - Métricas de rentabilidad
   - Reportes

3. Perfil de Usuario
   - Información del perfil
   - Cambio de contraseña
   - Preferencias

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
