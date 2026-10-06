import { Injectable, signal } from '@angular/core';


export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: number; // 1 = Administrador
}

const TOKEN_KEY = 'emi_token';
const USER_KEY = 'emi_user';


@Injectable({ providedIn: 'root' })
export class AuthService {
  public readonly currentUser = signal<SessionUser | null>(this.loadUser());

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY) && this.currentUser() !== null;
  }

  getCurrentUser(): SessionUser | null {
    return this.currentUser();
  }

  setSession(token: string, user: SessionUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  private loadUser(): SessionUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  }
}