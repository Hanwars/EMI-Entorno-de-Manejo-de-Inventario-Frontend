import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

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

@Component({
  selector: 'app-users',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users {
  readonly users = EXAMPLE_USERS;
  readonly activeUsers = this.users.filter((user) => user.active).length;

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('');
  }

}
