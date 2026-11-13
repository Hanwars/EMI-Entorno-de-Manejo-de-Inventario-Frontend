import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
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
import { Observable, finalize, map } from 'rxjs';
import { Usuario } from '../../models/usuario';
import { CambiosUsuario, UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

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

export type UsuarioEditable = UsuarioCreado;

@Component({
  selector: 'app-user-form',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm implements OnInit {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);

  readonly usuario = input<UsuarioEditable | null>(null);
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

  ngOnInit(): void {
    const usuario = this.usuario();
    if (usuario) {
      this.nombre = usuario.nombre;
      this.email = usuario.email;
      this.rolId = usuario.rol_id;
    }
  }

  esEdicion(): boolean {
    return this.usuario() !== null;
  }

  esUsuarioActual(): boolean {
    const usuario = this.usuario();
    return usuario !== null && this.auth.currentUser()?.id === usuario.usuario_id;
  }

  nombreNormalizado(): string {
    return this.nombre.trim().replace(/\s+/g, ' ');
  }

  emailNormalizado(): string {
    return this.email.trim().toLowerCase();
  }

  correoDuplicado(): boolean {
    const email = this.emailNormalizado();
    const propio = this.usuario()?.email.trim().toLowerCase();
    return (
      email.length > 0 &&
      email !== propio &&
      this.correosExistentes().some((c) => c.trim().toLowerCase() === email)
    );
  }

  contrasenaMuyLarga(): boolean {
    return new TextEncoder().encode(this.contrasena).length > this.maxContrasena;
  }

  contrasenasDistintas(): boolean {
    return this.confirmacion.length > 0 && this.confirmacion !== this.contrasena;
  }

  cambios(): CambiosUsuario {
    const usuario = this.usuario();
    const cambios: CambiosUsuario = {};
    if (!usuario) {
      return cambios;
    }
    if (this.nombreNormalizado() !== usuario.nombre.trim()) {
      cambios.nombre = this.nombreNormalizado();
    }
    if (this.emailNormalizado() !== usuario.email.trim().toLowerCase()) {
      cambios.email = this.emailNormalizado();
    }
    if (!this.esUsuarioActual() && this.rolId !== null && this.rolId !== usuario.rol_id) {
      cambios.rolId = this.rolId;
    }
    return cambios;
  }

  sinCambios(): boolean {
    return this.esEdicion() && Object.keys(this.cambios()).length === 0;
  }

  guardar(form: NgForm): void {
    const hayErrores =
      form.invalid ||
      this.correoDuplicado() ||
      (!this.esEdicion() && (this.contrasenaMuyLarga() || this.confirmacion !== this.contrasena));

    if (hayErrores || this.guardando()) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.sinCambios()) {
      this.cancelar();
      return;
    }

    this.errorClave.set(null);
    this.guardando.set(true);

    const usuarioActual = this.usuario();
    const datos: UsuarioCreado = {
      usuario_id: usuarioActual?.usuario_id ?? 0,
      nombre: this.nombreNormalizado(),
      email: this.emailNormalizado(),
      rol_id: this.rolId!,
    };

    const peticion: Observable<number> = usuarioActual
      ? this.userService.updateUser(usuarioActual.usuario_id, this.cambios()).pipe(map(() => usuarioActual.usuario_id))
      : this.userService
          .createUser(new Usuario(0, datos.rol_id, datos.nombre, this.contrasena, datos.email))
          .pipe(map((res) => res?.idGenerado ?? 0));

    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (id) => {
        this.cerrarDialogo();
        this.guardado.emit({ ...datos, usuario_id: id });
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
        return this.esEdicion() ? 'users.form.editNotAvailable' : 'users.form.notAvailable';
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