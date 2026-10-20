import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

// Diseño estático: todavía no consulta la API ni ejecuta acciones de administración.
// Cambiar estadoVista manualmente permite revisar las variantes visuales.
type EstadoVista = 'datos' | 'cargando' | 'vacio';

interface RolVista {
  role_id: number;
  nombre: string;
}

@Component({
  selector: 'app-role',
  imports: [TranslatePipe],
  templateUrl: './role.html',
  styleUrl: './role.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Role {
  estadoVista: EstadoVista = 'datos';

  // Datos de ejemplo basados únicamente en los campos role_id y nombre del modelo Rol.
  readonly roles: RolVista[] = [
    { role_id: 1, nombre: 'Administrador' },
    { role_id: 2, nombre: 'Encargado de inventario' },
    { role_id: 3, nombre: 'Consulta' },
  ];
}
