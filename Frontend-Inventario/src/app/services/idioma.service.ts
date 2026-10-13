import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export type Idioma = 'es' | 'en';

const CLAVE_IDIOMA = 'emi.idioma';

export const IDIOMA_PREDETERMINADO: Idioma = 'es';

@Injectable({ providedIn: 'root' })
export class IdiomaService {
  readonly idiomasDisponibles: Idioma[] = ['es', 'en'];
  readonly idiomaActual = signal<Idioma>(IDIOMA_PREDETERMINADO);

  constructor(private readonly translate: TranslateService) {}

  async inicializar(): Promise<void> {
    let guardado: string | null = null;

    try {
      guardado = localStorage.getItem(CLAVE_IDIOMA);
    } catch {
      // La aplicación puede funcionar aunque el navegador bloquee localStorage.
    }

    const idiomaNavegador =
      typeof navigator !== 'undefined'
        ? navigator.language.slice(0, 2).toLowerCase()
        : IDIOMA_PREDETERMINADO;

    const inicial = this.esIdiomaValido(guardado)
      ? guardado
      : this.esIdiomaValido(idiomaNavegador)
        ? idiomaNavegador
        : IDIOMA_PREDETERMINADO;

    await this.cambiarIdioma(inicial);
  }

  async cambiarIdioma(idioma: string): Promise<void> {
    if (!this.esIdiomaValido(idioma)) {
      return;
    }

    try {
      await firstValueFrom(this.translate.use(idioma));
      this.idiomaActual.set(idioma);

      if (typeof document !== 'undefined') {
        document.documentElement.lang = idioma;
      }

      try {
        localStorage.setItem(CLAVE_IDIOMA, idioma);
      } catch {
        // El idioma permanece activo durante esta sesión aunque no se pueda guardar.
      }
    } catch (error) {
      console.error(`No se pudo cargar el idioma "${idioma}".`, error);
    }
  }

  private esIdiomaValido(idioma: string | null): idioma is Idioma {
    return idioma !== null && this.idiomasDisponibles.includes(idioma as Idioma);
  }
}
