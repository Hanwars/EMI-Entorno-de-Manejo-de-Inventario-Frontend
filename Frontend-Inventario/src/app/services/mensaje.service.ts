import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class MensajeService {
  private readonly translate = inject(TranslateService);

  mostrarError(clave: string, parametros?: Record<string, unknown>): void {
    const titulo = this.translate.instant('messages.errorTitle');
    const mensaje = this.translate.instant(clave, parametros);
    window.alert(`${titulo}\n\n${mensaje}`);
  }

  mostrarAdvertencia(clave: string, parametros?: Record<string, unknown>): void {
    const titulo = this.translate.instant('messages.warningTitle');
    const mensaje = this.translate.instant(clave, parametros);
    window.alert(`${titulo}\n\n${mensaje}`);
  }

  confirmar(clave: string, parametros?: Record<string, unknown>): boolean {
    const titulo = this.translate.instant('messages.confirmationTitle');
    const mensaje = this.translate.instant(clave, parametros);
    return window.confirm(`${titulo}\n\n${mensaje}`);
  }

  mostrarErrorHttp(error: HttpErrorResponse | number): void {
    const status = typeof error === 'number' ? error : error.status;

    if (status === 0) {
      this.mostrarError('errors.network');
      return;
    }

    const clavesPorEstado: Record<number, string> = {
      400: 'errors.badRequest',
      401: 'errors.unauthorized',
      403: 'errors.forbidden',
      404: 'errors.notFound',
      409: 'errors.conflict',
      422: 'errors.validation',
    };

    const clave = status >= 500
      ? 'errors.server'
      : (clavesPorEstado[status] ?? 'errors.unknown');

    this.mostrarError(clave);
  }
}
