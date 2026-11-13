import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { Rol } from '../../models/rol';
import { RoleService } from '../../services/role.service';
import { RoleForm } from '../role-form/role-form';

type EstadoVista = 'datos' | 'cargando' | 'vacio' | 'error';

interface MensajeExito {
  clave: string;
  nombre: string;
}

@Component({
  selector: 'app-role',
  imports: [TranslatePipe, RoleForm],
  templateUrl: './role.html',
  styleUrl: './role.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Role implements OnInit {
  private readonly roleService = inject(RoleService);

  readonly roles = signal<Rol[]>([]);
  readonly estadoVista = signal<EstadoVista>('cargando');
  readonly formularioAbierto = signal(false);
  readonly rolEnEdicion = signal<Rol | null>(null);
  readonly rolAEliminar = signal<Rol | null>(null);
  readonly eliminando = signal(false);
  readonly busqueda = signal('');
  readonly mensajeExito = signal<MensajeExito | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly rolesFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLocaleLowerCase();

    if (!termino) {
      return this.roles();
    }

    return this.roles().filter(
      (rol) =>
        rol.nombre.toLocaleLowerCase().includes(termino) ||
        String(rol.role_id).includes(termino),
    );
  });

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.estadoVista.set('cargando');
    this.mensajeError.set(null);

    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.estadoVista.set(roles.length > 0 ? 'datos' : 'vacio');
      },
      error: (error: HttpErrorResponse) => {
        this.estadoVista.set('error');
        this.mensajeError.set(this.claveError(error));
      },
    });
  }

  abrirFormulario(): void {
    this.mensajeExito.set(null);
    this.mensajeError.set(null);
    this.rolEnEdicion.set(null);
    this.formularioAbierto.set(true);
  }

  editarRol(rol: Rol): void {
    if (this.esRolProtegido(rol)) {
      return;
    }

    this.mensajeExito.set(null);
    this.mensajeError.set(null);
    this.rolEnEdicion.set(rol);
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.rolEnEdicion.set(null);
  }

  alGuardarRol(rol: Rol): void {
    const estabaEditando = this.rolEnEdicion() !== null;

    if (estabaEditando) {
      this.roles.update((actuales) =>
        actuales.map((actual) => (actual.role_id === rol.role_id ? rol : actual)),
      );
      this.mensajeExito.set({ clave: 'roles.form.updated', nombre: rol.nombre });
    } else {
      this.roles.update((actuales) => [...actuales, rol]);
      this.mensajeExito.set({ clave: 'roles.form.created', nombre: rol.nombre });
    }

    this.estadoVista.set('datos');
    this.mensajeError.set(null);
    this.cerrarFormulario();
  }

  esRolProtegido(rol: Rol): boolean {
    // El backend identifica al Administrador mediante el role_id 1.
    return rol.role_id === 1;
  }

  abrirConfirmacionEliminar(rol: Rol): void {
    if (this.esRolProtegido(rol)) {
      return;
    }

    this.mensajeExito.set(null);
    this.mensajeError.set(null);
    this.rolAEliminar.set(rol);
  }

  cerrarConfirmacionEliminar(): void {
    if (this.eliminando()) {
      return;
    }

    this.rolAEliminar.set(null);
    this.mensajeError.set(null);
  }

  confirmarEliminacion(): void {
    const rol = this.rolAEliminar();

    if (!rol || this.eliminando() || this.esRolProtegido(rol)) {
      return;
    }

    this.mensajeError.set(null);
    this.eliminando.set(true);

    this.roleService.deleteRole(rol.role_id).subscribe({
      next: () => {
        this.roles.update((actuales) => actuales.filter((actual) => actual.role_id !== rol.role_id));
        this.estadoVista.set(this.roles().length > 0 ? 'datos' : 'vacio');
        this.mensajeExito.set({ clave: 'roles.deleted', nombre: rol.nombre });
        this.rolAEliminar.set(null);
        this.eliminando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.mensajeError.set(error.status === 409 ? 'roles.deleteConflict' : this.claveError(error));
        this.eliminando.set(false);
      },
    });
  }

  private claveError(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'errors.network';
      case 400:
      case 422:
        return 'errors.badRequest';
      case 401:
        return 'errors.unauthorized';
      case 403:
        return 'errors.forbidden';
      case 404:
        return 'errors.notFound';
      case 409:
        return 'errors.conflict';
      default:
        return error.status >= 500 ? 'errors.server' : 'errors.unknown';
    }
  }
}
