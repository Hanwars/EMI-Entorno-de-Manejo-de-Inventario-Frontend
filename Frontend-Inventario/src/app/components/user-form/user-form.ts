import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { Usuario } from '../../models/usuario';
import { UserService } from '../../services/user.service';


export interface OpcionRol {
  role_id: number;
  nombre: string;
}


export interface UsuarioCreado {
  usuario_id: number;
  nombre: string;
  email: string;
  rol_id: number;
}


@Component({
  selector: 'app-user-form',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm {
  private readonly userService = inject(UserService);

 
  readonly roles = input<OpcionRol[]>([]);


  readonly correosExistentes = input<string[]>([]);

  readonly guardado = output<UsuarioCreado>();
  readonly cancelado = output<void>();


  readonly minContrasena = 8;
  readonly maxContrasena = 72;

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  nombre = '';
  email = '';
  contrasena = '';
  confirmacion = '';
  rolId: number | null = null;

  mostrarContrasena = false;

  readonly guardando = signal(false);
  readonly errorClave = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.dialogo().nativeElement.showModal());
  }


  nombreNormalizado(): string {
    return this.nombre.trim().replace(/\s+/g, ' ');
  }

 
  emailNormalizado(): string {
    return this.email.trim().toLowerCase();
  }

  correoDuplicado(): boolean {
    const email = this.emailNormalizado();
    return email.length > 0 && this.correosExistentes().some((c) => c.trim().toLowerCase() === email);
  }


  contrasenaMuyLarga(): boolean {
    return new TextEncoder().encode(this.contrasena).length > this.maxContrasena;
  }

  contrasenasDistintas(): boolean {
    return this.confirmacion.length > 0 && this.confirmacion !== this.contrasena;
  }

  guardar(form: NgForm): void {
    const hayErrores =
      form.invalid ||
      this.correoDuplicado() ||
      this.contrasenaMuyLarga() ||
      this.confirmacion !== this.contrasena;

    if (hayErrores || this.guardando()) {
      form.control.markAllAsTouched();
      return;
    }

    this.errorClave.set(null);
    this.guardando.set(true);

    const usuario = new Usuario(0, this.rolId!, this.nombreNormalizado(), this.contrasena, this.emailNormalizado());

    this.userService
      .createUser(usuario)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (res) => {
          this.cerrarDialogo();
          this.guardado.emit({
            usuario_id: res?.idGenerado ?? 0,
            nombre: usuario.nombre,
            email: usuario.email ?? '',
            rol_id: usuario.rol_id,
          });
        },
        error: (err: HttpErrorResponse) => this.errorClave.set(this.claveError(err)),
      });
  }

  
  limpiarError(): void {
    if (this.errorClave()) {
      this.errorClave.set(null);
    }
  }

  cancelar(): void {
    if (this.guardando()) {
      return;
    }
    this.cerrarDialogo();
    this.cancelado.emit();
  }

  alPresionarEscape(event: Event): void {
    event.preventDefault();
    this.cancelar();
  }

  private cerrarDialogo(): void {
    const dialogo = this.dialogo().nativeElement;
    if (dialogo.open) {
      dialogo.close();
    }
  }

  private claveError(err: HttpErrorResponse): string {
    switch (true) {
      case err.status === 0:
        return 'errors.network';
      case err.status === 404:
        return 'users.form.notAvailable';
      case err.status === 409:
        return 'users.form.emailDuplicate';
      case err.status === 400 || err.status === 422:
        return 'errors.badRequest';
      case err.status === 401:
        return 'errors.unauthorized';
      case err.status === 403:
        return 'errors.forbidden';
      case err.status >= 500:
        return 'errors.server';
      default:
        return 'errors.unknown';
    }
  }
}