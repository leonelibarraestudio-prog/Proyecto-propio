import { Component, OnInit } from '@angular/core';
import { AppCopyKey, AppLanguage, I18nService } from '../../../core/services/i18n.service';
import {
  LiveEventApi,
  LiveEventsHeroRefApi,
  LiveEventsNarrativeLineApi,
} from './model/live-events-api.interface';
import { LiveEventsViewModel } from './model/live-events-view-model.interface';
import { LiveEventsService } from './service/live-events.service';

const EVENT_TYPE_COPY: Record<string, AppCopyKey> = {
  TOURNAMENT_FINAL_STARTED: 'r10.type.started',
  ACTION: 'r10.type.action',
  ATTACK_HIT: 'r10.type.attackHit',
  DAMAGE: 'r10.type.damage',
  AP_CHANGE: 'r10.type.apChange',
  STRATEGY_CHANGE: 'r10.type.strategyChange',
  SWAP: 'r10.type.swap',
  EFFECT: 'r10.type.effect',
  CLEANSE: 'r10.type.cleanse',
  SURFER_ENOUGH: 'r10.type.reveal',
  DOOM_REVEALED: 'r10.type.reveal',
  DOOM_EXPLANATION: 'r10.type.reveal',
  PLAYER_REJECTION: 'r10.type.reveal',
  OPPONENT_ALLIANCE: 'r10.type.reveal',
  DOOMSDAY_BEGINS: 'r10.type.doomsdayBegins',
};

const EVENT_TONE: Record<string, string> = {
  ACTION: 'action',
  ATTACK_HIT: 'damage',
  DAMAGE: 'damage',
  AP_CHANGE: 'resource',
  EFFECT: 'resource',
  CLEANSE: 'resource',
  STRATEGY_CHANGE: 'tactics',
  SWAP: 'tactics',
  TOURNAMENT_FINAL_STARTED: 'story',
  SURFER_ENOUGH: 'story',
  DOOM_REVEALED: 'story',
  DOOM_EXPLANATION: 'story',
  PLAYER_REJECTION: 'story',
  OPPONENT_ALLIANCE: 'story',
  DOOMSDAY_BEGINS: 'story',
};

const PHASE_COPY: Record<string, AppCopyKey> = {
  TOURNAMENT_FINAL: 'r10.phase.tournamentFinal',
  DOOMSDAY: 'r10.phase.doomsday',
};

const OUTCOME_COPY: Record<string, AppCopyKey> = {
  VICTORY: 'r6.victory',
  DEFEAT: 'r6.defeat',
  ABANDON: 'r6.abandon',
};

const STAT_COPY: Record<string, AppCopyKey> = {
  power: 'heroRoster.power',
  agility: 'heroRoster.agility',
  resistance: 'heroRoster.resistance',
  ability: 'heroRoster.ability',
};

@Component({
  selector: 'app-live-events',
  templateUrl: './live-events.component.html',
  styleUrls: ['./live-events.component.css'],
  standalone: false,
})
export class LiveEventsComponent implements OnInit {
  readonly simulateRoute = '/journey/simulation';

  constructor(
    private readonly liveEventsService: LiveEventsService,
    private readonly i18nService: I18nService,
  ) {}

  get pageState(): LiveEventsViewModel {
    return this.liveEventsService.getViewModel();
  }

  ngOnInit(): void {
    this.liveEventsService.initialize();
  }

  refresh(): void {
    this.liveEventsService.refresh();
  }

  translate(
    key: AppCopyKey,
    lang: AppLanguage,
    params: Record<string, string | number> = {},
  ): string {
    return this.i18nService.translate(key, lang, params);
  }

  trackEvent(_index: number, event: LiveEventApi): number {
    return event.sequence;
  }

  trackLine(_index: number, line: LiveEventsNarrativeLineApi): number {
    return line.lineSequence;
  }

  titleFirstWord(): string {
    return this.translate('r10.title', this.pageState.lang).split(' ')[0];
  }

  titleRemainder(): string {
    return this.translate('r10.title', this.pageState.lang).split(' ').slice(1).join(' ');
  }

  eventTypeLabel(event: LiveEventApi): string {
    const key = EVENT_TYPE_COPY[event.eventCode];
    return key ? this.translate(key, this.pageState.lang) : event.eventCode;
  }

  eventTone(event: LiveEventApi): string {
    return EVENT_TONE[event.eventCode] ?? 'neutral';
  }

  phaseLabel(phase: string): string {
    const key = PHASE_COPY[phase];
    return key ? this.translate(key, this.pageState.lang) : phase;
  }

  finalStateLabel(): string {
    const finalStage = this.pageState.data?.finalStage;
    if (!finalStage) {
      return '';
    }
    let key: AppCopyKey = 'r10.state.ready';
    if (finalStage.completed) {
      key = 'r10.state.completed';
    } else if (finalStage.status === 'ACTIVE') {
      key = 'r10.state.active';
    }
    return this.translate(key, this.pageState.lang);
  }

  outcomeLabel(): string | null {
    const code = this.pageState.data?.finalStage.outcomeCode;
    if (!code) {
      return null;
    }
    const key = OUTCOME_COPY[code];
    return key ? this.translate(key, this.pageState.lang) : code;
  }

  heroLabel(hero: LiveEventsHeroRefApi): string {
    return hero.name ?? this.humanizeId(hero.id);
  }

  visibleTargets(event: LiveEventApi): LiveEventsHeroRefApi[] {
    return event.targets.filter((target) => target.id !== event.actor?.id);
  }

  targetsLabel(event: LiveEventApi): string {
    return this.visibleTargets(event)
      .map((target) => this.heroLabel(target))
      .join(', ');
  }

  hasFacts(event: LiveEventApi): boolean {
    return (
      event.actor !== null ||
      this.visibleTargets(event).length > 0 ||
      event.targetTeamSide !== null ||
      event.actionName !== null ||
      event.damage !== null ||
      event.abilityPoints !== null ||
      event.energy !== null ||
      (event.statCode !== null && event.percent !== null)
    );
  }

  sideLabel(side: string): string {
    const key: AppCopyKey = side === 'PLAYER' ? 'r10.playerTeam' : 'r10.opponentTeam';
    return this.translate(key, this.pageState.lang);
  }

  statLabel(statCode: string): string {
    const key = STAT_COPY[statCode];
    return key ? this.translate(key, this.pageState.lang) : statCode;
  }

  signed(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }

  signedPercent(percent: number): string {
    return `${this.signed(percent)}%`;
  }

  isDialogue(line: LiveEventsNarrativeLineApi): boolean {
    return line.type === 'DIALOGUE';
  }

  private humanizeId(id: string): string {
    return id
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
