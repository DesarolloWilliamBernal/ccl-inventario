import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'ccl_token';
const USUARIO_KEY = 'ccl_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly usuario = signal<string | null>(localStorage.getItem(USUARIO_KEY));
  readonly estaAutenticado = computed(() => this.tokenSignal() !== null);

  constructor(private http: HttpClient) {}

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credenciales).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.tokenSignal.set(null);
    this.usuario.set(null);
  }

  obtenerToken(): string | null {
    return this.tokenSignal();
  }

  private guardarSesion(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USUARIO_KEY, res.usuario);
    this.tokenSignal.set(res.token);
    this.usuario.set(res.usuario);
  }
}
