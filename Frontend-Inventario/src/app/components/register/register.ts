import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  public user: Usuario;

 
  public mostrarContrasena = false;

  public toast = {
    show: false,
    message: '',
    typeClass: 'bg-success',
  };

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {
    this.user = new Usuario(0, 2, '', '', null);
  }

  showToast(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success'): void {
    this.toast.message = message;
    this.toast.typeClass = `bg-${type}`;
    this.toast.show = true;

    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 8000);
  }

  saveUser(form: NgForm): void {
    if (form.invalid) {
      this.showToast('register.invalidForm', 'warning');
      return;
    }

    this.userService.createUser(this.user).subscribe({
      next: (response) => {
        console.log('Usuario creado correctamente:', response);

      
        this.showToast('register.success', 'success');

        form.resetForm();
        this.mostrarContrasena = false;
       
        this.user = new Usuario(0, 2, '', '', null);
        this.cdr.detectChanges();
      },

      error: (err: HttpErrorResponse) => {
       
        console.error('Error al registrar usuario:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          respuestaBackend: err.error,
        });

        const tipo = err.status === 409 ? 'warning' : 'danger';
        const claveMensaje = err.status === 409 ? 'register.duplicate' : 'register.error';

        this.showToast(claveMensaje, tipo);
        this.cdr.detectChanges();
      },
    });
  }
}
