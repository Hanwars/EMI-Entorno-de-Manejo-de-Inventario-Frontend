import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
/* 
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Frontend-Inventario');
  public currentUser;
  private checkSessionInterval;

  constructor(private _auth: AuthService, private router: Router) {
    this.currentUser = _auth.currentUser;
    this.checkSessionInterval = setInterval(() => {
      this.checkSession();
    }, 1000);
  }


  checkSession() {
    if (!this._auth.isAuthenticated()) {
      this._auth.logout();
      this.currentUser.set(null);
    }
  
  
  }

  logout() {
    this._auth.logout();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
*/