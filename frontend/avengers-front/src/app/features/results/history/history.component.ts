import { Component, OnInit } from '@angular/core';
import { AppCopyKey, AppLanguage, I18nService } from '../../../core/services/i18n.service';
import { HistoryItem, HistoryService, HistoryViewModel } from './service/history.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  standalone: false,
})
export class HistoryComponent implements OnInit {
  constructor(
    private readonly historyService: HistoryService,
    private readonly i18nService: I18nService,
  ) {}

  get pageState(): HistoryViewModel {
    return this.historyService.getViewModel();
  }

  ngOnInit(): void {
    this.historyService.initialize();
  }

  retry(): void {
    this.historyService.initialize();
  }

  translate(
    key: AppCopyKey,
    lang: AppLanguage,
    params: Record<string, string | number> = {},
  ): string {
    return this.i18nService.translate(key, lang, params);
  }

  trackItem(_index: number, item: HistoryItem): string {
    return item.attemptId;
  }

  outcomeLabel(code: string): string {
    const labels: Record<string, string> = {
      VICTORY: 'Victoria',
      DEFEAT: 'Derrota',
      ABANDON: 'Abandono',
    };
    return labels[code] ?? code;
  }

  strategyLabel(code: string): string {
    const labels: Record<string, string> = {
      SAVE: 'Ahorrar',
      BALANCED: 'Equilibrada',
      AGGRESSIVE: 'Agresiva',
    };
    return labels[code] ?? code;
  }
}