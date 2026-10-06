import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  public readonly currentUser = this.auth.currentUser;

  // Revisa cada 30 segundos si la sesión sigue siendo válida
  private readonly checkSessionInterval = setInterval(() => this.checkSession(), 30_000);

  checkSession(): void {
    if (this.currentUser() && !this.auth.isAuthenticated()) {
      this.logout();
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    clearInterval(this.checkSessionInterval);
  }
}