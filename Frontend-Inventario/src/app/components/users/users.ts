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
import { OpcionRol, UserForm, UsuarioCreado } from '../user-form/user-form';
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

  /** Usuarios obtenidos del backend. */
  readonly users = signal<UsuarioApi[]>([]);

  /** Roles obtenidos del backend, para mostrar su nombre y elegirlos en el formulario. */
  readonly roles = signal<OpcionRol[]>([]);

  /** true mientras se carga el listado. */
  readonly cargando = signal(true);

  /** Clave de traducción del error devuelto al cargar el listado; null si no hay error. */
  readonly errorCarga = signal<string | null>(null);

  /** true mientras se procesa una eliminación. */
  readonly eliminando = signal(false);

  private readonly dialogoEliminacion =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialogoEliminacion');

  readonly formularioAbierto = signal(false);

  readonly usuarioRegistrado = signal<string | null>(null);

  readonly usuarioEliminado = signal<string | null>(null);

  readonly usuarioPorEliminar = signal<UsuarioApi | null>(null);

  /** Correos ya registrados, para que el formulario avise de duplicados antes de enviar. */
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
      // Si los roles no se pueden obtener, la lista muestra el número de rol.
      error: () => this.roles.set([]),
    });
  }

  /** Identificador con el formato visual de la tabla, por ejemplo USR-007. */
  formatoId(id: number): string {
    return `USR-${String(id).padStart(3, '0')}`;
  }

  /** Nombre del rol; si los roles no están disponibles, su número. */
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

  abrirFormulario(): void {
    this.usuarioRegistrado.set(null);
    this.usuarioEliminado.set(null);
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
  }

  alGuardarUsuario(usuario: UsuarioCreado): void {
    this.formularioAbierto.set(false);
    this.usuarioRegistrado.set(usuario.nombre);
    this.usuarioEliminado.set(null);

    // Se recarga desde el backend para mostrar los datos tal como quedaron guardados.
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
          this.usuarioRegistrado.set(null);
          this.usuarioEliminado.set(usuario.nombre);
          this.cerrarDialogoEliminacion();
        },
        error: (err: HttpErrorResponse) => {
          this.cerrarDialogoEliminacion();
          // El error del backend se muestra con el servicio de mensajes del proyecto.
          this.mensajes.mostrarErrorHttp(err);

          // Si el usuario ya no existe, se actualiza el listado para reflejarlo.
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
