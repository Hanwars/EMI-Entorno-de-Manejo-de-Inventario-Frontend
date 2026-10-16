import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from '../../models/usuario';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  public status: number;
  public user: Usuario;

 
  public mostrarContrasena = false;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.status = -1;
    this.user = new Usuario(0, 0, '', '', '');
  }

  onSubmit(form: any): void {
    if (form.invalid) {
      return;
    }

    this._authService.login(this.user).subscribe({
      next: (response: LoginResponse) => {
        if (response.access_token?.length > 0) {
          this._router.navigate(['']);
        } else {
          this.status = 0;
        }

        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.status = 0;
        } else {
          this.status = 1;
        }

        this.cdr.detectChanges();
      },
    });
  }
}
