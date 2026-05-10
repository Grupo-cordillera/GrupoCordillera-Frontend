export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  nombre: string;
  correo: string;
  direccion: string;
  telefono: string;
  rol: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  direccion: string;
  telefono: string;
  numero_rol: number;
}

export interface RegisterResponse {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  direccion: string;
  telefono: string;
  rol: RolDto;
}

export interface RolDto {
  id: number;
  numeroRol: number;
  nombre: string;
  funcion: string;
}

export interface User {
  nombre: string;
  correo: string;
  direccion: string;
  telefono: string;
  rol: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
  loading: boolean;
}
