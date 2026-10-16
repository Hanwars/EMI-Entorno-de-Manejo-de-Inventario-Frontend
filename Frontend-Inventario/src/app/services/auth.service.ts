import { Injectable, signal } from '@angular/core';
import { Usuario, UserPaylod } from '../models/usuario';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as environment } from '../../environments/environment';

export interface LoginResponse {
  access_token: string;
  payload: UserPaylod;
}

const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'identity';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url: string;

  currentUser = signal<UserPaylod | null>(this.leerUsuarioGuardado());

  constructor(private _http: HttpClient) {
    this.url = environment.apiUrl;
  }

  login(credentials: Usuario): Observable<LoginResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http
      .post<LoginResponse>(this.url + 'login', credentials, { headers })
      .pipe(tap((response) => this.guardarSesion(response)));
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_USUARIO);
  }

  /** Devuelve el token de la sesión actual, o null si no hay sesión. */
  getToken(): string | null {
    return sessionStorage.getItem(CLAVE_TOKEN);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UserPaylod | null {
    return this.currentUser();
  }

  /** Guarda el token y los datos del usuario al iniciar sesión. */
  private guardarSesion(response: LoginResponse): void {
    sessionStorage.setItem(CLAVE_TOKEN, response.access_token);
    sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(response.payload));
    this.currentUser.set(response.payload);
  }

  /** Lee el usuario guardado. Si los datos están dañados, se cierra la sesión para no romper la aplicación. */
  private leerUsuarioGuardado(): UserPaylod | null {
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_USUARIO) || 'null');
    } catch {
      sessionStorage.removeItem(CLAVE_TOKEN);
      sessionStorage.removeItem(CLAVE_USUARIO);
      return null;
    }
  }
}
