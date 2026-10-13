import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export type Idioma = 'es' | 'en';

/** Datos que necesita el selector de idioma para dibujar cada opción. */
export interface OpcionIdioma {
  codigo: Idioma;
  abreviatura: string; // texto visible en el botón (ES / EN)
  nombre: string;      // aria-label, escrito en su propio idioma
}

const CLAVE_IDIOMA = 'emi.idioma';

export const IDIOMA_PREDETERMINADO: Idioma = 'es';

/**
 * Unico punto de la aplicación autorizado para cambiar el idioma.
 */
@Injectable({ providedIn: 'root' })
export class IdiomaService {
<<<<<<< HEAD
  readonly idiomasDisponibles: readonly Idioma[] = ['es', 'en'];

  readonly idiomaActual = signal<Idioma>(IDIOMA_PREDETERMINADO);
=======
  readonly idiomasDisponibles: Idioma[] = ['es', 'en'];

  /** Opciones para el selector de idioma (ES / EN). */
  readonly opciones: readonly OpcionIdioma[] = [
    { codigo: 'es', abreviatura: 'ES', nombre: 'Español' },
    { codigo: 'en', abreviatura: 'EN', nombre: 'English' },
  ];

  private readonly _idiomaActual = signal<Idioma>(IDIOMA_PREDETERMINADO);

  /** Idioma activo (solo lectura). Para cambiarlo se usa cambiarIdioma(). */
  readonly idiomaActual = this._idiomaActual.asReadonly();
>>>>>>> 1d81510a506d3bf09f4271bd1f45a79b2b490367

  private colaCambios: Promise<void> = Promise.resolve();

  constructor(private readonly translate: TranslateService) {}

  /**
   * Se ejecuta al arrancar la app (provideAppInitializer).
   * Orden que sigue:  preferencia guardada → idioma del navegador → español.
   * No guarda nada, la preferencia solo se guarda cuando el usuario elige.
   */
  async inicializar(): Promise<void> {
    const guardado = this.leerPreferencia();

    const idiomaNavegador =
      typeof navigator !== 'undefined' && navigator.language
<<<<<<< HEAD
        ? navigator.language.split('-')[0].toLowerCase()
=======
        ? navigator.language.slice(0, 2).toLowerCase()
>>>>>>> 1d81510a506d3bf09f4271bd1f45a79b2b490367
        : IDIOMA_PREDETERMINADO;

    const inicial = this.esIdiomaValido(guardado)
      ? guardado
      : this.esIdiomaValido(idiomaNavegador)
        ? idiomaNavegador
        : IDIOMA_PREDETERMINADO;

    await this.aplicarIdioma(inicial);
  }

  /** Cambia el idioma por elección del usuario y guarda la preferencia. */
  async cambiarIdioma(idioma: string): Promise<void> {
    if (!this.esIdiomaValido(idioma)) {
      console.warn(`Idioma no permitido: "${idioma}".`);
      return;
    }
    if (idioma === this._idiomaActual()) {
      return;
    }

<<<<<<< HEAD
    const cambio = this.colaCambios.then(async () => {
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
        console.error(
          `No se pudo cargar el idioma "${idioma}".`,
          error
        );
      }
    });

    this.colaCambios = cambio;

    await cambio;
=======
    const aplicado = await this.aplicarIdioma(idioma);
    if (aplicado) {
      this.guardarPreferencia(idioma);
    }
  }



  /** Carga el JSON del idioma y actualiza el estado y el atributo lang. */
  private async aplicarIdioma(idioma: Idioma): Promise<boolean> {
    try {
      await firstValueFrom(this.translate.use(idioma));
      this._idiomaActual.set(idioma);

      if (typeof document !== 'undefined') {
        document.documentElement.lang = idioma;
      }
      return true;
    } catch (error) {
      console.error(`No se pudo cargar el idioma "${idioma}".`, error);
      return false;
    }
  }

  private leerPreferencia(): string | null {
    try {
      return localStorage.getItem(CLAVE_IDIOMA);
    } catch {
      return null; // La aplicación puede funcionar aunque el navegador bloquee localStorage.
    }
  }

  private guardarPreferencia(idioma: Idioma): void {
    try {
      localStorage.setItem(CLAVE_IDIOMA, idioma);
    } catch {
      // El idioma permanece activo durante esta sesión aunque no se pueda guardar.
    }
>>>>>>> 1d81510a506d3bf09f4271bd1f45a79b2b490367
  }

  private esIdiomaValido(
    idioma: string | null
  ): idioma is Idioma {
    return (
      idioma !== null &&
      this.idiomasDisponibles.some(
        disponible => disponible === idioma
      )
    );
  }
}