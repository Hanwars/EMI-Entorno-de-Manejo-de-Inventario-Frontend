import { Injectable } from '@angular/core';
import { environment as enviroment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { AuthService } from './auth.service';

export interface CreateUserResponse {
  idGenerado: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly url: string;

  constructor(private _http: HttpClient, private auth: AuthService) {
    this.url = enviroment.apiUrl;
  }

  createUser(user: Usuario): Observable<CreateUserResponse> {
    const payload = {
      rolId: user.rol_id,
      nombre: user.nombre,
      contrasena: user.contrasena,
      email: user.email,
    };

    const token = this.auth.getToken();

    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this._http.post<CreateUserResponse>(
      this.url + 'register',
      payload,
      { headers },
    );
  }
}