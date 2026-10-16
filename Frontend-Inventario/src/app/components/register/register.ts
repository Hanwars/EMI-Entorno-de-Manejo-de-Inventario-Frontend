import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  public user: Usuario;

  public mostrarContrasena = false;

  // Controla si hay una petición de registro en curso.
  public registrando = false;

  public toast = {
    show: false,
    message: '',
    typeClass: 'bg-success',
  };

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {
    this.user = new Usuario(0, 2, '', '', null);
  }

  showToast(
    message: string,
    type: 'success' | 'danger' | 'info' | 'warning' = 'success',
  ): void {
    this.toast.message = message;
    this.toast.typeClass = `bg-${type}`;
    this.toast.show = true;

    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 8000);
  }

  saveUser(form: NgForm): void {
    // Evita enviar el formulario si ya hay una petición en curso.
    if (this.registrando) {
      return;
    }

    // Comprueba las validaciones del formulario.
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.showToast('register.invalidForm', 'warning');
      return;
    }

    // bcrypt admite como máximo 72 bytes, no 72 caracteres.
    const contrasena = this.user.contrasena ?? '';
    const bytesContrasena = new TextEncoder().encode(contrasena).length;

    if (bytesContrasena > 72) {
      this.showToast('register.passwordTooLong', 'warning');
      return;
    }

    this.registrando = true;

    this.userService
      .createUser(this.user)
      .pipe(
        finalize(() => {
          this.registrando = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          console.log('Usuario creado correctamente:', response);

          this.showToast('register.success', 'success');

          form.resetForm();
          this.mostrarContrasena = false;
          this.user = new Usuario(0, 2, '', '', null);

          this.cdr.detectChanges();
        },

        error: (err: HttpErrorResponse) => {
          console.error('Error al registrar usuario:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            respuestaBackend: err.error,
          });

          let tipo: 'warning' | 'danger' = 'danger';
          let claveMensaje = 'register.error';

          if (err.status === 409) {
            tipo = 'warning';
            claveMensaje = 'register.duplicate';
          } else if (err.status === 400) {
            tipo = 'warning';
            claveMensaje = 'register.invalidForm';
          }

          this.showToast(claveMensaje, tipo);
          this.cdr.detectChanges();
        },
      });
  }
}