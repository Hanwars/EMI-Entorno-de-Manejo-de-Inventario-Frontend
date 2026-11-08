import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { OpcionRol, UserForm, UsuarioCreado, UsuarioEditable } from '../user-form/user-form';
import { UserService, UsuarioApi } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { MensajeService } from '../../services/mensaje.service';

@Component({
  selector: 'app-users',
  imports: [TranslatePipe, UserForm],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly mensajes = inject(MensajeService);

  readonly users = signal<UsuarioApi[]>([]);

  readonly roles = signal<OpcionRol[]>([]);

  readonly cargando = signal(true);

  readonly errorCarga = signal<string | null>(null);

  readonly eliminando = signal(false);

  private readonly dialogoEliminacion =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialogoEliminacion');

  readonly formularioAbierto = signal(false);

  readonly usuarioEnEdicion = signal<UsuarioEditable | null>(null);

  readonly usuarioRegistrado = signal<string | null>(null);

  readonly usuarioActualizado = signal<string | null>(null);

  readonly usuarioEliminado = signal<string | null>(null);

  readonly usuarioPorEliminar = signal<UsuarioApi | null>(null);

  readonly correos = computed(() =>
    this.users()
      .map((user) => user.email)
      .filter((email): email is string => !!email),
  );

  constructor() {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.userService
      .getAllUsers()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (usuarios) => this.users.set(usuarios ?? []),
        error: (err: HttpErrorResponse) => this.errorCarga.set(this.mensajes.claveErrorHttp(err)),
      });
  }

  private cargarRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) =>
        this.roles.set((roles ?? []).map((rol) => ({ role_id: rol.role_id, nombre: rol.nombre }))),
      error: () => this.roles.set([]),
    });
  }

  formatoId(id: number): string {
    return `USR-${String(id).padStart(3, '0')}`;
  }

  nombreRol(rolId: number): string {
    return this.roles().find((rol) => rol.role_id === rolId)?.nombre ?? String(rolId);
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('');
  }

  private limpiarMensajes(): void {
    this.usuarioRegistrado.set(null);
    this.usuarioActualizado.set(null);
    this.usuarioEliminado.set(null);
  }

  abrirFormulario(): void {
    this.limpiarMensajes();
    this.usuarioEnEdicion.set(null);
    this.formularioAbierto.set(true);
  }

  editarUsuario(usuario: UsuarioApi): void {
    this.limpiarMensajes();
    this.usuarioEnEdicion.set({
      usuario_id: usuario.usuarioId,
      nombre: usuario.nombre,
      email: usuario.email ?? '',
      rol_id: usuario.rolId,
    });
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.usuarioEnEdicion.set(null);
  }

  alGuardarUsuario(usuario: UsuarioCreado): void {
    const eraEdicion = this.usuarioEnEdicion() !== null;

    this.cerrarFormulario();
    this.limpiarMensajes();

    if (eraEdicion) {
      this.usuarioActualizado.set(usuario.nombre);
    } else {
      this.usuarioRegistrado.set(usuario.nombre);
    }

    this.cargarUsuarios();
  }

  solicitarEliminacion(usuario: UsuarioApi): void {
    this.usuarioPorEliminar.set(usuario);
    this.dialogoEliminacion().nativeElement.showModal();
  }

  cancelarEliminacion(event?: Event): void {
    event?.preventDefault();
    if (this.eliminando()) {
      return;
    }
    this.cerrarDialogoEliminacion();
  }

  confirmarEliminacion(): void {
    const usuario = this.usuarioPorEliminar();
    if (!usuario || this.eliminando()) {
      return;
    }

    this.eliminando.set(true);

    this.userService
      .deleteUser(usuario.usuarioId)
      .pipe(finalize(() => this.eliminando.set(false)))
      .subscribe({
        next: () => {
          this.users.update((users) => users.filter((user) => user.usuarioId !== usuario.usuarioId));
          this.limpiarMensajes();
          this.usuarioEliminado.set(usuario.nombre);
          this.cerrarDialogoEliminacion();
        },
        error: (err: HttpErrorResponse) => {
          this.cerrarDialogoEliminacion();
          this.mensajes.mostrarErrorHttp(err);

          if (err.status === 404) {
            this.cargarUsuarios();
          }
        },
      });
  }

  private cerrarDialogoEliminacion(): void {
    const dialogo = this.dialogoEliminacion().nativeElement;
    if (dialogo.open) {
      dialogo.close();
    }
    this.usuarioPorEliminar.set(null);
  }
}