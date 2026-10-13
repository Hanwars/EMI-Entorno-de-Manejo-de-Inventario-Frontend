import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { SelectorIdioma } from './core/components/selector-idioma/selector-idioma';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslatePipe, SelectorIdioma],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  public readonly currentUser = this.auth.currentUser;

  // Revisa cada 30 segundos si la sesión sigue siendo válida.
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
