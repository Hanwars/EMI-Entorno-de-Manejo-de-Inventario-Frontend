import { Injectable, signal } from '@angular/core';
import { Usuario, UserPaylod } from '../models/usuario';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as environment } from '../../environments/environment';

export interface LoginResponse {
  access_token: string;
  payload: UserPaylod;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url: string;

  currentUser = signal<UserPaylod | null>(
    JSON.parse(sessionStorage.getItem('identity') || 'null'),
  );

  constructor(private _http: HttpClient) {
    this.url = environment.apiUrl;
  }

  login(credentials: Usuario): Observable<LoginResponse> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http
      .post<LoginResponse>(this.url + 'login', credentials, { headers })
      .pipe(
        tap((response) => {
          this.currentUser.set(response.payload);
          sessionStorage.setItem('token', response.access_token);
          sessionStorage.setItem('identity', JSON.stringify(response.payload));
        }),
      );
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('identity');
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getCurrentUser(): UserPaylod | null {
    return this.currentUser();
  }
}
