import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Rol } from '../../models/rol';
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
  estadoVista: EstadoVista = 'datos';


  roles: RolVista[] = [
    { role_id: 1, nombre: 'Administrador' },
    { role_id: 2, nombre: 'Encargado de inventario' },
    { role_id: 3, nombre: 'Consulta' },
  ];

 
  readonly formularioAbierto = signal(false);


  readonly rolRegistrado = signal<string | null>(null);

  abrirFormulario(): void {
    this.rolRegistrado.set(null);
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
  }

  alGuardarRol(rol: Rol): void {
    this.roles = [...this.roles, { role_id: rol.role_id, nombre: rol.nombre }];
    this.estadoVista = 'datos';
    this.formularioAbierto.set(false);
    this.rolRegistrado.set(rol.nombre);
  }
}