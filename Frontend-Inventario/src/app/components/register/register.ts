import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from '../../models/usuario';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  public user: Usuario;

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

  showToast(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success'): void {
    this.toast.message = message;
    this.toast.typeClass = `bg-${type}`;
    this.toast.show = true;

    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 8000);
  }

  saveUser(form: NgForm): void {
    if (form.invalid) {
      this.showToast('register.invalidForm', 'warning');
      return;
    }

    this.userService.createUser(this.user).subscribe({
      next: (response) => {
        console.log('Usuario creado correctamente:', response);

        this.showToast('¡Registro completado! El usuario se guardó correctamente.', 'success');

        form.resetForm();
        this.user = new Usuario(0, 10, '', '', null);
        this.cdr.detectChanges();
      },

      error: (err: HttpErrorResponse) => {
        // Información técnica para identificar la causa del error.
        console.error('Error al registrar usuario:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          respuestaBackend: err.error,
        });

        const tipo = err.status === 409 ? 'warning' : 'danger';

        const claveMensaje = err.status === 409 ? 'register.duplicate' : 'register.error';

        this.showToast(claveMensaje, tipo);
        this.cdr.detectChanges();
      },
    });
  }

  private obtenerMensajeError(err: HttpErrorResponse): string {
    // Intentamos obtener el mensaje que envió el backend.
    let detalle: string | null = null;

    if (typeof err.error === 'string' && err.error.trim() !== '') {
      detalle = err.error;
    } else if (err.error && typeof err.error === 'object') {
      const respuesta = err.error.error ?? err.error.message;

      if (typeof respuesta === 'string' && respuesta.trim() !== '') {
        detalle = respuesta;
      } else if (respuesta && typeof respuesta === 'object') {
        detalle = JSON.stringify(respuesta);
      }
    }

    switch (err.status) {
      case 0:
        return 'No se pudo conectar con el servidor. Comprueba que el backend esté encendido y que la conexión funcione.';

      case 400:
        return detalle
          ? `Los datos enviados no son válidos: ${detalle}`
          : 'El servidor rechazó los datos del registro. Revisa los campos enviados.';

      case 401:
        return 'No tienes autorización para realizar esta operación. Inicia sesión nuevamente si corresponde.';

      case 403:
        return 'Acceso denegado. Tu usuario no tiene permisos para registrar usuarios.';

      case 404:
        return 'No se encontró la ruta de registro. Comprueba la URL y las rutas configuradas en el backend.';

      case 409:
        return detalle
          ? `Conflicto al registrar: ${detalle}`
          : 'El registro entra en conflicto con un dato existente. Comprueba si el correo ya está registrado.';

      case 500:
        return detalle
          ? `Error interno del servidor. Detalle recibido: ${detalle}`
          : 'El servidor falló al procesar el registro. Revisa la terminal de Go y los errores de SQL Server para conocer la causa.';

      default:
        return detalle
          ? `Error HTTP ${err.status}: ${detalle}`
          : `Ocurrió un error inesperado (HTTP ${err.status}). Revisa la consola para ver más detalles.`;
    }
  }
}
