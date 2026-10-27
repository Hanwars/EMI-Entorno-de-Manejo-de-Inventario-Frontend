import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rol } from '../models/rol';

interface RolRespuesta {
  idGenerado?: number;
  role_id?: number;
  nombre?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);


  private readonly url = `${environment.apiUrl}roles`;

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.url, { headers: this.headers() });
  }

 
  createRole(nombre: string): Observable<Rol> {
    return this.http
      .post<RolRespuesta>(this.url, { nombre }, { headers: this.headers() })
      .pipe(map((res) => new Rol(res?.role_id ?? res?.idGenerado ?? 0, res?.nombre ?? nombre)));
  }


  updateRole(id: number, nombre: string): Observable<Rol> {
    return this.http
      .put<RolRespuesta | null>(`${this.url}/${id}`, { nombre }, { headers: this.headers() })
      .pipe(map((res) => new Rol(id, res?.nombre ?? nombre)));
  }

 
  private headers(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = sessionStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}