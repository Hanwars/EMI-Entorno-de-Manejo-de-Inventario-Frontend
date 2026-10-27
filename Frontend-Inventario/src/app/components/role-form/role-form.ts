import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
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
import { Observable, finalize } from 'rxjs';
import { Rol } from '../../models/rol';
import { RoleService } from '../../services/role.service';


@Component({
  selector: 'app-role-form',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './role-form.html',
  styleUrl: './role-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleForm implements OnInit {
  private readonly roleService = inject(RoleService);

  /* Rol a editar. Si es null, el formulario registra un rol nuevo. */
  readonly rol = input<Rol | { role_id: number; nombre: string } | null>(null);

 
  readonly rolesExistentes = input<{ role_id?: number; nombre: string }[]>([]);

 
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

  ngOnInit(): void {
   
    this.nombre = this.rol()?.nombre ?? '';
  }

  esEdicion(): boolean {
    return this.rol() !== null;
  }


  nombreNormalizado(): string {
    return this.nombre.trim().replace(/\s+/g, ' ');
  }


  esDuplicado(): boolean {
    const nombre = this.nombreNormalizado().toLocaleLowerCase();
    const idActual = this.rol()?.role_id;
    return (
      nombre.length > 0 &&
      this.rolesExistentes().some(
        (r) => r.role_id !== idActual && r.nombre.trim().toLocaleLowerCase() === nombre,
      )
    );
  }

  sinCambios(): boolean {
    return this.esEdicion() && this.nombreNormalizado() === (this.rol()?.nombre ?? '').trim();
  }

  guardar(form: NgForm): void {
    if (form.invalid || this.esDuplicado() || this.guardando()) {
      form.control.markAllAsTouched();
      return;
    }


    if (this.sinCambios()) {
      this.cancelar();
      return;
    }

    this.errorClave.set(null);
    this.guardando.set(true);

    const nombre = this.nombreNormalizado();
    const rolActual = this.rol();
    const peticion: Observable<Rol> = rolActual
      ? this.roleService.updateRole(rolActual.role_id, nombre)
      : this.roleService.createRole(nombre);

    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
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
        // Al registrar: el endpoint todavía no existe.
        // Al editar: el rol ya no existe o el endpoint todavía no existe.
        return this.esEdicion() ? 'roles.form.editNotAvailable' : 'roles.form.notAvailable';
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