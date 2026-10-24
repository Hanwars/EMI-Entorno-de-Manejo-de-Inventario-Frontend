import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Rol } from '../../models/rol';
import { MensajeService } from '../../services/mensaje.service';
import { RoleForm } from '../role-form/role-form';


type EstadoVista = 'datos' | 'cargando' | 'vacio';

interface RolVista {
  role_id: number;
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
  private readonly mensajes = inject(MensajeService);

  estadoVista: EstadoVista = 'datos';


  roles: RolVista[] = [
    { role_id: 1, nombre: 'Administrador' },
    { role_id: 2, nombre: 'Encargado de inventario' },
    { role_id: 3, nombre: 'Consulta' },
  ];

 
  readonly formularioAbierto = signal(false);


  readonly rolRegistrado = signal<string | null>(null);

  readonly rolEliminado = signal<string | null>(null);

  abrirFormulario(): void {
    this.rolRegistrado.set(null);
    this.rolEliminado.set(null);
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
  }

  alGuardarRol(rol: Rol): void {
    this.roles = [...this.roles, { role_id: rol.role_id, nombre: rol.nombre }];
    this.estadoVista = 'datos';
    this.formularioAbierto.set(false);
    this.rolEliminado.set(null);
    this.rolRegistrado.set(rol.nombre);
  }

  eliminarRol(rol: RolVista): void {
    if (!this.mensajes.confirmar('roles.confirmDelete', { name: rol.nombre })) {
      return;
    }

    this.roles = this.roles.filter((rolActual) => rolActual !== rol);
    this.estadoVista = this.roles.length === 0 ? 'vacio' : 'datos';
    this.rolRegistrado.set(null);
    this.rolEliminado.set(rol.nombre);
  }
}
