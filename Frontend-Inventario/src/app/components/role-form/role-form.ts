import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { Rol } from '../../models/rol';
import { RoleService } from '../../services/role.service';


@Component({
  selector: 'app-role-form',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './role-form.html',
  styleUrl: './role-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleForm {
  private readonly roleService = inject(RoleService);


  readonly rolesExistentes = input<{ nombre: string }[]>([]);

 
  readonly guardado = output<Rol>();

 
  readonly cancelado = output<void>();

  readonly maxCaracteres = 50;

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  nombre = '';
  readonly guardando = signal(false);
  readonly errorClave = signal<string | null>(null);

  constructor() {
  
    afterNextRender(() => this.dialogo().nativeElement.showModal());
  }

  
  nombreNormalizado(): string {
    return this.nombre.trim().replace(/\s+/g, ' ');
  }


  esDuplicado(): boolean {
    const nombre = this.nombreNormalizado().toLocaleLowerCase();
    return nombre.length > 0 && this.rolesExistentes().some((r) => r.nombre.trim().toLocaleLowerCase() === nombre);
  }

  guardar(form: NgForm): void {
    if (form.invalid || this.esDuplicado() || this.guardando()) {
      form.control.markAllAsTouched();
      return;
    }

    this.errorClave.set(null);
    this.guardando.set(true);

    this.roleService
      .createRole(this.nombreNormalizado())
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (rol) => {
          this.cerrarDialogo();
          this.guardado.emit(rol);
        },
        error: (err: HttpErrorResponse) => this.errorClave.set(this.claveError(err)),
      });
  }

  cancelar(): void {
    if (this.guardando()) {
      return;
    }
    this.cerrarDialogo();
    this.cancelado.emit();
  }

 
  alPresionarEscape(event: Event): void {
    event.preventDefault();
    this.cancelar();
  }

  private cerrarDialogo(): void {
    const dialogo = this.dialogo().nativeElement;
    if (dialogo.open) {
      dialogo.close();
    }
  }

  private claveError(err: HttpErrorResponse): string {
    switch (true) {
      case err.status === 0:
        return 'errors.network';
      case err.status === 404:
       
        return 'roles.form.notAvailable';
      case err.status === 409:
        return 'roles.form.duplicate';
      case err.status === 400 || err.status === 422:
        return 'errors.badRequest';
      case err.status === 401:
        return 'errors.unauthorized';
      case err.status === 403:
        return 'errors.forbidden';
      case err.status >= 500:
        return 'errors.server';
      default:
        return 'errors.unknown';
    }
  }
}