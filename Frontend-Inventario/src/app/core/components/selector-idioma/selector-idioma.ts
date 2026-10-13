import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IdiomaService } from '../../../services/idioma.service';

@Component({
  selector: 'app-selector-idioma',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './selector-idioma.html',
  styleUrl: './selector-idioma.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorIdioma {
  readonly idiomaService = inject(IdiomaService);

  cambiarIdioma(idioma: 'es' | 'en'): void {
    void this.idiomaService.cambiarIdioma(idioma);
  }
}
