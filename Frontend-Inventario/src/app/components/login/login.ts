import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { Usuario } from '../../models/usuario';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { MensajeService } from '../../services/mensaje.service';

/** Error que se muestra dentro de la tarjeta del login. */
interface ErrorLogin {
  clave: string;                 // clave de traducción del mensaje
  tipo: 'error' | 'warning';     // error del usuario o problema del sistema
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mensajes = inject(MensajeService);

  public user = new Usuario(0, 0, '', '', '');

  /** Controla el botón para mostrar u ocultar la contraseña. */
  public mostrarContrasena = false;

  /** true mientras se espera la respuesta del servidor. */
  public readonly cargando = signal(false);

  /** Error actual; null si no hay ninguno. */
  public readonly error = signal<ErrorLogin | null>(null);

  onSubmit(form: NgForm): void {
    // Evita enviar si el formulario es inválido o ya hay una petición en curso.
    if (form.invalid || this.cargando()) {
      form.control.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.cargando.set(true);

    this.authService
      .login(this.user)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (response: LoginResponse) => {
          if (response?.access_token?.length > 0) {
            // replaceUrl evita que el botón "Atrás" regrese al formulario de inicio de sesión.
            this.router.navigateByUrl(this.obtenerDestino(), { replaceUrl: true });
          } else {
            // El servidor respondió, pero sin token: no se puede iniciar sesión.
            this.error.set({ clave: 'errors.unknown', tipo: 'warning' });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(this.convertirError(err));

          // Con credenciales incorrectas se borra la contraseña para volver a escribirla.
          if (err.status === 401) {
            this.user.contrasena = '';
          }
        },
      });
  }

  /** Se llama al editar un campo: el mensaje anterior deja de ser válido. */
  limpiarError(): void {
    if (this.error()) {
      this.error.set(null);
    }
  }

  /** Convierte la respuesta HTTP en el mensaje adecuado para el inicio de sesión. */
  private convertirError(err: HttpErrorResponse): ErrorLogin {
    // Credenciales incorrectas: mensaje específico del login.
    if (err.status === 401) {
      return { clave: 'auth.loginError', tipo: 'error' };
    }

    // Datos con formato inválido.
    if (err.status === 400 || err.status === 422) {
      return { clave: this.mensajes.claveErrorHttp(err), tipo: 'error' };
    }

    // Servidor caído, sin red o error interno: es un problema del sistema, no del usuario.
    if (err.status >= 500) {
      return { clave: 'auth.loginServerError', tipo: 'warning' };
    }

    return { clave: this.mensajes.claveErrorHttp(err), tipo: 'warning' };
  }

  /** Página a la que se va tras iniciar sesión. Solo se aceptan rutas internas de la aplicación. */
  private obtenerDestino(): string {
    const destino = this.route.snapshot.queryParamMap.get('returnUrl');
    return destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : '/home';
  }
}
