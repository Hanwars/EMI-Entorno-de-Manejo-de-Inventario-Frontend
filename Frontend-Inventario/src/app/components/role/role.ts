import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Rol } from '../../models/rol';
import { RoleForm } from '../role-form/role-form';


type EstadoVista = 'datos' | 'cargando' | 'vacio';

interface RolVista {
  role_id: number;
  nombre: string;
}

/** Mensaje que se muestra arriba de la tabla después de guardar. */
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
export class Role {
  estadoVista: EstadoVista = 'datos';

  // Datos de ejemplo basados únicamente en los campos role_id y nombre del modelo Rol
  roles: RolVista[] = [
    { role_id: 1, nombre: 'Administrador' },
    { role_id: 2, nombre: 'Encargado de inventario' },
    { role_id: 3, nombre: 'Consulta' },
  ];

  readonly formularioAbierto = signal(false);


  readonly rolEnEdicion = signal<RolVista | null>(null);


  readonly mensajeExito = signal<MensajeExito | null>(null);


  abrirFormulario(): void {
    this.mensajeExito.set(null);
    this.rolEnEdicion.set(null);
    this.formularioAbierto.set(true);
  }

 
  editarRol(rol: RolVista): void {
    this.mensajeExito.set(null);
    this.rolEnEdicion.set(rol);
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
    this.rolEnEdicion.set(null);
  }

  alGuardarRol(rol: Rol): void {
    const vista: RolVista = { role_id: rol.role_id, nombre: rol.nombre };

    if (this.rolEnEdicion()) {
      
      this.roles = this.roles.map((r) => (r.role_id === vista.role_id ? vista : r));
      this.mensajeExito.set({ clave: 'roles.form.updated', nombre: vista.nombre });
    } else {
      
      this.roles = [...this.roles, vista];
      this.mensajeExito.set({ clave: 'roles.form.created', nombre: vista.nombre });
    }

    this.estadoVista = 'datos';
    this.cerrarFormulario();
  }
}