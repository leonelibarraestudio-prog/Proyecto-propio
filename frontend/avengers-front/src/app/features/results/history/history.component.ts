import { Component, OnInit } from '@angular/core';
import { AppCopyKey, AppLanguage, I18nService } from '../../../core/services/i18n.service';
import {
  HistoryAward,
  HistoryEvent,
  HistoryHero,
  HistoryItem,
  HistoryService,
  HistoryTeam,
  HistoryTeamStatistics,
  HistoryViewModel,
} from './service/history.service';

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

  openDetail(item: HistoryItem, attemptNumber: number): void {
    this.historyService.openDetail(item.attemptId, attemptNumber);
  }

  retryDetail(): void {
    this.historyService.retryDetail();
  }

  closeDetail(): void {
    this.historyService.closeDetail();
  }

  showMoreEvents(): void {
    this.historyService.showMoreEvents();
  }

  translate(
    key: AppCopyKey,
    lang: AppLanguage,
    params: Record<string, string | number> = {},
  ): string {
    return this.i18nService.translate(key, lang, params);
  }

  outcomeLabel(code: string | null | undefined, lang: AppLanguage): string {
    if (!code) {
      return this.translate('r13.notRecorded', lang);
    }
    const keys: Record<string, AppCopyKey> = {
      VICTORY: 'r13.outcomeVictory',
      DEFEAT: 'r13.outcomeDefeat',
      ABANDON: 'r13.outcomeAbandon',
    };
    const key = keys[code];
    return key ? this.translate(key, lang) : code;
  }

  strategyLabel(code: string, lang: AppLanguage): string {
    const keys: Record<string, AppCopyKey> = {
      SAVE: 'r13.strategySave',
      BALANCED: 'r13.strategyBalanced',
      AGGRESSIVE: 'r13.strategyAggressive',
    };
    const key = keys[code];
    return key ? this.translate(key, lang) : code;
  }

  heroLabel(heroId: string): string {
    return heroId
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  teamLabel(teamNames: Record<string, string>, teamId: string): string {
    return teamNames[teamId] ?? teamId;
  }

  heroStatusLabel(hero: HistoryHero, lang: AppLanguage): string {
    if (hero.knockedOut) {
      return this.translate('r13.knockedOut', lang);
    }
    return this.translate(hero.status === 'ACTIVE' ? 'r13.active' : 'r13.inactive', lang);
  }

  eventText(event: HistoryEvent): string {
    return event.narrative.lines.map((line) => line.text).join(' ');
  }

  eventsToShow(events: HistoryEvent[], visible: number): HistoryEvent[] {
    return events.slice(0, visible);
  }

  remainingEvents(total: number, visible: number): number {
    return Math.max(total - visible, 0);
  }

  trackItem(_index: number, item: HistoryItem): string {
    return item.attemptId;
  }

  trackTeam(_index: number, team: HistoryTeam): string {
    return team.teamId;
  }

  trackHero(_index: number, hero: HistoryHero): string {
    return hero.heroId;
  }

  trackTeamStatistics(_index: number, stats: HistoryTeamStatistics): string {
    return stats.teamId;
  }

  trackAward(_index: number, award: HistoryAward): string {
    return award.code;
  }

  trackEvent(_index: number, event: HistoryEvent): number {
    return event.sequence;
  }
}