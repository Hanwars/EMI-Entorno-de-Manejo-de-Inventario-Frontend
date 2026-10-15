import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { MensajeService } from '../../services/mensaje.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let httpTestingController: HttpTestingController;
  let auth: { setSession: ReturnType<typeof vi.fn> };
  let mensajes: {
    mostrarAdvertencia: ReturnType<typeof vi.fn>;
    mostrarError: ReturnType<typeof vi.fn>;
    mostrarErrorHttp: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    auth = { setSession: vi.fn() };
    mensajes = {
      mostrarAdvertencia: vi.fn(),
      mostrarError: vi.fn(),
      mostrarErrorHttp: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: auth },
        { provide: MensajeService, useValue: mensajes },
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  afterEach(() => httpTestingController.verify());

  it('evita enviar credenciales vacías', () => {
    component.iniciarSesion();

    expect(mensajes.mostrarAdvertencia).toHaveBeenCalledWith('auth.validationRequired');
    httpTestingController.expectNone(`${environment.apiUrl}login`);
  });

  it('rechaza un correo con formato inválido antes de consultar el servidor', () => {
    component.email = 'correo-invalido';
    component.contrasena = 'secreto';

    component.iniciarSesion();

    expect(mensajes.mostrarAdvertencia).toHaveBeenCalledWith('auth.validationEmail');
    httpTestingController.expectNone(`${environment.apiUrl}login`);
  });

  it('envía credenciales válidas y crea la sesión solo con respuesta completa', () => {
    component.email = 'usuario@ejemplo.com';
    component.contrasena = 'secreto';

    component.iniciarSesion();

    const request = httpTestingController.expectOne(`${environment.apiUrl}login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'usuario@ejemplo.com',
      contrasena: 'secreto',
    });

    request.flush({
      access_token: 'token-valido',
      payload: { id: 7, name: 'Usuario', role: 1 },
    });

    expect(auth.setSession).toHaveBeenCalledWith('token-valido', {
      id: 7,
      name: 'Usuario',
      role: 1,
      email: 'usuario@ejemplo.com',
    });
    expect(component.enviando).toBe(false);
  });

  it('no crea sesión cuando el servidor rechaza las credenciales', () => {
    component.email = 'usuario@ejemplo.com';
    component.contrasena = 'incorrecta';

    component.iniciarSesion();
    httpTestingController
      .expectOne(`${environment.apiUrl}login`)
      .flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.setSession).not.toHaveBeenCalled();
    expect(mensajes.mostrarError).toHaveBeenCalledWith('auth.invalidCredentials');
    expect(component.enviando).toBe(false);
  });

  it('informa cuando el servidor no permite el acceso a la cuenta', () => {
    component.email = 'usuario@ejemplo.com';
    component.contrasena = 'secreto';

    component.iniciarSesion();
    httpTestingController
      .expectOne(`${environment.apiUrl}login`)
      .flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(auth.setSession).not.toHaveBeenCalled();
    expect(mensajes.mostrarError).toHaveBeenCalledWith('auth.accessDenied');
  });

  it('no crea sesión si la respuesta de autenticación está incompleta', () => {
    component.email = 'usuario@ejemplo.com';
    component.contrasena = 'secreto';

    component.iniciarSesion();
    httpTestingController
      .expectOne(`${environment.apiUrl}login`)
      .flush({ access_token: 'token-valido', payload: { id: 7, name: 'Usuario' } });

    expect(auth.setSession).not.toHaveBeenCalled();
    expect(mensajes.mostrarError).toHaveBeenCalledWith('auth.loginResponseInvalid');
  });

  it('redirige al inicio después de establecer la sesión', () => {
    const router = TestBed.inject(Router);
    component.email = 'usuario@ejemplo.com';
    component.contrasena = 'secreto';

    component.iniciarSesion();
    httpTestingController.expectOne(`${environment.apiUrl}login`).flush({
      access_token: 'token-valido',
      payload: { id: 7, name: 'Usuario', role: 1 },
    });

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
