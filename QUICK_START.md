# 🚀 Guía Rápida de Inicio

## ¿Qué se ha creado?

Se ha generado un proyecto completo de frontend con arquitectura Atomic Design para una aplicación profesional de gestión de inventario retail.

## 📁 Estructura Creada

```
src/
├── components/
│   ├── atoms/
│   │   ├── Input/              (Campo de entrada profesional)
│   │   ├── Button/             (Botón con loading state)
│   │   ├── Logo/               (Logo de marca)
│   │   └── Alert/              (Alertas de error/éxito)
│   ├── molecules/
│   │   ├── Card/               (Contenedor de contenido)
│   │   └── LoginForm/          (Formulario de login)
│   ├── pages/
│   │   ├── Login/              (Página de inicio de sesión)
│   │   └── Dashboard/          (Página de bienvenida)
│   └── ProtectedRoute/         (Wrapper para rutas protegidas)
├── context/
│   └── AuthContext.tsx         (Estado global de autenticación)
├── hooks/
│   └── useLogin.ts             (Hook para lógica de login)
├── services/
│   └── authService.ts          (Cliente HTTP para API)
├── types/
│   └── auth.ts                 (Tipos TypeScript de autenticación)
└── styles/
    ├── global.css              (Estilos globales)
    ├── components/
    │   ├── atoms.css           (Estilos de atoms)
    │   └── molecules.css       (Estilos de molecules)
    └── pages/
        ├── login.css           (Estilos de login)
        └── dashboard.css       (Estilos de dashboard)
```

## 🎯 Funcionalidades Implementadas

✅ **Login profesional**
- Formulario con validación
- Manejo de errores
- Estado de loading
- Diseño moderno con gradientes

✅ **Autenticación JWT**
- Token almacenado en localStorage
- Interceptor automático en requests
- Protección de rutas

✅ **Gestión de Estado**
- Context API para autenticación global
- Hooks personalizados
- Acceso fácil a datos de usuario

✅ **Diseño Profesional**
- Colores corporativos para retail
- Sistema de espaciado consistente
- Animaciones suaves
- Responsive en móvil

## ⚙️ Primeros Pasos

### 1. Instala dependencias
```bash
npm install
```

### 2. Configura el backend
Actualiza `.env` con tu URL del backend:
```
VITE_API_URL=http://localhost:8080
```

### 3. Inicia el servidor de desarrollo
```bash
npm run dev
```

La aplicación abrirá en `http://localhost:5173`

## 🧪 Pruebas Iniciales

1. Navega a `http://localhost:5173/login`
2. Ingresa tus credenciales de usuario
3. Si el login es exitoso:
   - Serás redirigido a `/dashboard`
   - Verás tus datos de usuario
   - El token JWT se almacenará automáticamente

## 🔧 Configuración Importante

### CORS en Backend
Tu backend debe permitir requests desde `http://localhost:5173`:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## 📱 Estructura de Componentes

### Atoms (Reutilizables)
```tsx
<Input label="Usuario" placeholder="..." />
<Button variant="primary" size="large" isLoading={false}>
  Inicia Sesión
</Button>
<Alert type="error" message="Error al iniciar sesión" />
<Logo size="medium" />
```

### Molecules (Compuestos)
```tsx
<Card shadow="large">
  <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
</Card>
```

## 🎨 Paleta de Colores

- Primario: `#1e40af` (Azul profesional)
- Éxito: `#22c55e`
- Error: `#ef4444`
- Advertencia: `#f59e0b`
- Grises: Escala completa para UI

## 📝 Variables de Entorno

```env
# API Configuration
VITE_API_URL=http://localhost:8080
```

## 🔐 Almacenamiento

El frontend almacena:
- Token JWT en `localStorage.authToken`
- Datos de usuario en `localStorage.user`

Se borran automáticamente al cerrar sesión.

## 📊 Próximas Fases

### Fase 2: Panel de Inventario
- Listado de productos
- CRUD de productos
- Búsqueda y filtros
- Gestión de stock

### Fase 3: Panel de Estadísticas
- Gráficos de ventas
- Métricas de rentabilidad
- Reportes

### Fase 4: Perfil de Usuario
- Información del perfil
- Cambio de contraseña
- Preferencias

## 🆘 Troubleshooting

**Error: "Cannot GET /dashboard"**
- Asegúrate que React Router está correctamente configurado

**Error: "CORS error"**
- Configura CORS en tu backend
- Verifica que la URL en `.env` es correcta

**Token no se almacena**
- Verifica que localStorage está habilitado
- Mira la consola para errores

## 📞 Contacto

Para soporte o preguntas sobre la arquitectura, contacta al equipo de desarrollo.
