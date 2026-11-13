import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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
import { AuthService } from '../../services/auth.service';

interface Aviso {
  tipo: 'exito' | 'error';
  clave: string;
  nombre?: string;
}

const DURACION_AVISO_MS = 8000;

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
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = signal<UsuarioApi[]>([]);

  readonly roles = signal<OpcionRol[]>([]);

  readonly cargando = signal(true);

  readonly errorCarga = signal<string | null>(null);

  readonly eliminando = signal(false);

  private readonly dialogoEliminacion =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialogoEliminacion');

  readonly formularioAbierto = signal(false);

  readonly usuarioEnEdicion = signal<UsuarioEditable | null>(null);

  readonly usuarioPorEliminar = signal<UsuarioApi | null>(null);

  readonly aviso = signal<Aviso | null>(null);

  readonly busqueda = signal('');

  private temporizadorAviso: ReturnType<typeof setTimeout> | null = null;

  readonly correos = computed(() =>
    this.users()
      .map((user) => user.email)
      .filter((email): email is string => !!email),
  );

  readonly usuariosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    if (!termino) {
      return this.users();
    }
    return this.users().filter(
      (user) =>
        user.nombre.toLowerCase().includes(termino) ||
        (user.email ?? '').toLowerCase().includes(termino) ||
        this.nombreRol(user.rolId).toLowerCase().includes(termino),
    );
  });

  constructor() {
    this.cargarUsuarios();
    this.cargarRoles();
    this.destroyRef.onDestroy(() => this.cancelarTemporizador());
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

  esUsuarioActual(usuario: UsuarioApi): boolean {
    return this.auth.currentUser()?.id === usuario.usuarioId;
  }

  actualizarBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  mostrarAviso(aviso: Aviso): void {
    this.cancelarTemporizador();
    this.aviso.set(aviso);

    if (aviso.tipo === 'exito') {
      this.temporizadorAviso = setTimeout(() => this.aviso.set(null), DURACION_AVISO_MS);
    }
  }

  cerrarAviso(): void {
    this.cancelarTemporizador();
    this.aviso.set(null);
  }

  private cancelarTemporizador(): void {
    if (this.temporizadorAviso) {
      clearTimeout(this.temporizadorAviso);
      this.temporizadorAviso = null;
    }
  }

  abrirFormulario(): void {
    this.cerrarAviso();
    this.usuarioEnEdicion.set(null);
    this.formularioAbierto.set(true);
  }

  editarUsuario(usuario: UsuarioApi): void {
    this.cerrarAviso();
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
    this.mostrarAviso({
      tipo: 'exito',
      clave: eraEdicion ? 'users.form.updated' : 'users.form.created',
      nombre: usuario.nombre,
    });

    this.cargarUsuarios();
  }

  solicitarEliminacion(usuario: UsuarioApi): void {
    if (this.esUsuarioActual(usuario)) {
      return;
    }
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
          this.cerrarDialogoEliminacion();
          this.mostrarAviso({ tipo: 'exito', clave: 'users.deleted', nombre: usuario.nombre });
        },
        error: (err: HttpErrorResponse) => {
          this.cerrarDialogoEliminacion();
          this.mostrarAviso({ tipo: 'error', clave: this.claveErrorEliminacion(err), nombre: usuario.nombre });

          if (err.status === 404) {
            this.cargarUsuarios();
          }
        },
      });
  }

  private claveErrorEliminacion(err: HttpErrorResponse): string {
    if (err.status === 409) {
      return 'users.deleteConflict';
    }
    if (err.status === 404) {
      return 'users.deleteNotFound';
    }
    return this.mensajes.claveErrorHttp(err);
  }

  private cerrarDialogoEliminacion(): void {
    const dialogo = this.dialogoEliminacion().nativeElement;
    if (dialogo.open) {
      dialogo.close();
    }
    this.usuarioPorEliminar.set(null);
  }
}