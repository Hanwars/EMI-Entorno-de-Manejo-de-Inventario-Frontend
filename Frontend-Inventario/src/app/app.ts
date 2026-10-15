import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { SelectorIdioma } from './core/components/selector-idioma/selector-idioma';
import { MensajeService } from './services/mensaje.service';

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
  private readonly mensajes = inject(MensajeService);

  public readonly currentUser = this.auth.currentUser;

  get isLoginPage(): boolean {
    return this.router.url.split('?')[0] === '/login';
  }

  // Revisa cada 30 segundos si la sesión sigue siendo válida.
  private readonly checkSessionInterval = setInterval(() => this.checkSession(), 30_000);

  checkSession(): void {
    if (this.currentUser() && !this.auth.isAuthenticated()) {
      this.logout();
    }
  }

  logout(): void {
    if (!this.mensajes.confirmar('messages.confirmLogout')) {
      return;
    }

    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    clearInterval(this.checkSessionInterval);
  }
}
