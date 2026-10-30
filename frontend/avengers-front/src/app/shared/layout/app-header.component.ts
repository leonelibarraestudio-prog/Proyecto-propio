import { Component } from '@angular/core';
import { AppContextService } from '../../core/services/app-context.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css'],
  standalone: false,
})
export class AppHeaderComponent {
  constructor(
    readonly context: AppContextService,
    readonly i18n: I18nService,
  ) {}

  journeyStatusLabel(status: string | undefined): string {
  switch (status) {
    case 'PRE_FINAL':
      return 'Preparación de la Final';
    case 'FINAL_ACTIVE':
      return 'Batalla en curso';
    case 'COMPLETED':
      return 'Torneo completado';
    default:
      return status ? 'Estado en actualización' : 'Sin torneo iniciado';
  }
}
}
