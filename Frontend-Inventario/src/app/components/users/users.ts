import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OpcionRol, UserForm, UsuarioCreado } from '../user-form/user-form';

interface UserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
}

const EXAMPLE_USERS: UserRecord[] = [
  {
    id: 'USR-001',
    name: 'Eddier',
    username: 'eddier',
    email: 'eddier@example.com',
    role: 'Administrador',
    active: true,
  },
  {
    id: 'USR-002',
    name: 'Handy',
    username: 'handy',
    email: 'handy@example.com',
    role: 'Encargado de inventario',
    active: true,
  },
  {
    id: 'USR-003',
    name: 'Anthony',
    username: 'anthony',
    email: 'anthony@example.com',
    role: 'Consulta',
    active: false,
  },
];


const EXAMPLE_ROLES: OpcionRol[] = [
  { role_id: 1, nombre: 'Administrador' },
  { role_id: 2, nombre: 'Encargado de inventario' },
  { role_id: 3, nombre: 'Consulta' },
];

@Component({
  selector: 'app-users',
  imports: [TranslatePipe, UserForm],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users {
  users: UserRecord[] = [...EXAMPLE_USERS];
  readonly roles = EXAMPLE_ROLES;

 
  readonly formularioAbierto = signal(false);


  readonly usuarioRegistrado = signal<string | null>(null);

  get activeUsers(): number {
    return this.users.filter((user) => user.active).length;
  }


  get correos(): string[] {
    return this.users.map((user) => user.email);
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
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
  }

  alGuardarUsuario(usuario: UsuarioCreado): void {
    const rol = this.roles.find((r) => r.role_id === usuario.rol_id);
    const numero = usuario.usuario_id || this.users.length + 1;

    this.users = [
      ...this.users,
      {
        id: `USR-${String(numero).padStart(3, '0')}`,
        name: usuario.nombre,
        username: usuario.email.split('@')[0],
        email: usuario.email,
        role: rol?.nombre ?? '',
        active: true,
      },
    ];

    this.formularioAbierto.set(false);
    this.usuarioRegistrado.set(usuario.nombre);
  }
}