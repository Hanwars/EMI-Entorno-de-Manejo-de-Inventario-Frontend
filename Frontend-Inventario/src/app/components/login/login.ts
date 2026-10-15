import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { AuthService, SessionUser } from '../../services/auth.service';
import { MensajeService } from '../../services/mensaje.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly mensajes = inject(MensajeService);

  email = '';
  contrasena = '';
  enviando = false;

  iniciarSesion(): void {
    const email = this.email.trim();
    const contrasena = this.contrasena;

    if (!email || !contrasena.trim()) {
      this.mensajes.mostrarAdvertencia('auth.validationRequired');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.mensajes.mostrarAdvertencia('auth.validationEmail');
      return;
    }

    if (this.enviando) {
      return;
    }

    this.enviando = true;
    this.http
      .post<unknown>(`${environment.apiUrl}login`, { email, contrasena })
      .subscribe({
        next: (response) => this.procesarRespuesta(response, email),
        error: (error: HttpErrorResponse) => this.procesarError(error),
      });
  }

  private procesarRespuesta(response: unknown, email: string): void {
    if (!this.esRespuestaLogin(response)) {
      this.mensajes.mostrarError('auth.loginResponseInvalid');
      this.enviando = false;
      return;
    }

    this.auth.setSession(response.access_token, {
      ...response.payload,
      email,
    });
    this.enviando = false;
    void this.router.navigate(['/home']);
  }

  private procesarError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.mensajes.mostrarError('auth.invalidCredentials');
    } else if (error.status === 403) {
      this.mensajes.mostrarError('auth.accessDenied');
    } else {
      this.mensajes.mostrarErrorHttp(error);
    }

    this.enviando = false;
  }

  private esRespuestaLogin(
    response: unknown,
  ): response is { access_token: string; payload: Omit<SessionUser, 'email'> } {
    if (typeof response !== 'object' || response === null) {
      return false;
    }

    const candidate = response as {
      access_token?: unknown;
      payload?: { id?: unknown; name?: unknown; role?: unknown };
    };
    const payload = candidate.payload;

    return (
      typeof candidate.access_token === 'string' &&
      candidate.access_token.length > 0 &&
      typeof payload?.id === 'number' &&
      typeof payload.name === 'string' &&
      payload.name.length > 0 &&
      typeof payload.role === 'number'
    );
  }
}
