import { Injectable } from '@angular/core';
import { environment as enviroment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { AuthService } from './auth.service';

export interface CreateUserResponse {
  idGenerado: number;
}

/** Usuario tal como lo devuelve la API (sin contraseña). */
export interface UsuarioApi {
  usuarioId: number;
  rolId: number;
  nombre: string;
  email: string | null;
}

/** Campos que se pueden actualizar. Solo se envían los que cambian; el resto se conserva. */
export interface CambiosUsuario {
  rolId?: number;
  nombre?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly url: string;

  constructor(private _http: HttpClient, private auth: AuthService) {
    this.url = enviroment.apiUrl;
  }

  /** GET api/v1/users: listado de usuarios. */
  getAllUsers(): Observable<UsuarioApi[]> {
    return this._http.get<UsuarioApi[]>(this.url + 'users', { headers: this.headers() });
  }

  /** POST api/v1/register: registra un usuario. */
  createUser(user: Usuario): Observable<CreateUserResponse> {
    const payload = {
      rolId: user.rol_id,
      nombre: user.nombre,
      contrasena: user.contrasena,
      email: user.email,
    };

    return this._http.post<CreateUserResponse>(
      this.url + 'register',
      payload,
      { headers: this.headers() },
    );
  }

  /**
   * PUT api/v1/users/:id: actualiza solo los campos enviados.
   * No se depende del cuerpo de la respuesta; tras actualizar se recomienda recargar el listado.
   */
  updateUser(id: number, cambios: CambiosUsuario): Observable<unknown> {
    return this._http.put(`${this.url}users/${id}`, cambios, { headers: this.headers() });
  }

  /** DELETE api/v1/users/:id: elimina un usuario. */
  deleteUser(id: number): Observable<unknown> {
    return this._http.delete(`${this.url}users/${id}`, { headers: this.headers() });
  }

  private headers(): HttpHeaders {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    const token = this.auth.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}
