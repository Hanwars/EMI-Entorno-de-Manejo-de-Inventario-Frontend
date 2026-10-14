import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el título de inicio de sesión', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')).toBeTruthy();
  });

  it('debe mostrar los campos de correo y contraseña', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('debe mostrar el botón de inicio de sesión', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('button[type="button"]')).toBeTruthy();
  });
});