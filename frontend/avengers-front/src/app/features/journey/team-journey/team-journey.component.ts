import { Component, OnDestroy, OnInit } from '@angular/core';

import { AppCopyKey, I18nService } from '../../../core/services/i18n.service';
import { HeroArtworkResolverService } from '../../../core/services/hero-artwork-resolver.service';

import { TeamJourneyService } from './service/team-journey.service';
import {
  JourneyEncounterItem,
  JourneyEvent,
  JourneyRoster,
  JourneyRound,
} from './model/team-journey-api.interface';

// Groups published events for display without changing the API data.
interface CombatEventGroup {
  event: JourneyEvent;
  text: string;
  effects: Array<{
    event: JourneyEvent;
    text: string;
  }>;
}

@Component({
  selector: 'app-team-journey',
  templateUrl: './team-journey.component.html',
  styleUrls: ['./team-journey.component.css'],
  standalone: false,
})
export class TeamJourneyComponent implements OnInit, OnDestroy {
  private groupedRound: JourneyRound | null = null;

  private groupedLanguage = '';

  private groups: CombatEventGroup[] = [];

  constructor(
    public readonly teamJourneyService: TeamJourneyService,
    public readonly i18nService: I18nService,
    public readonly artwork: HeroArtworkResolverService,
  ) {}

  ngOnInit(): void {
    this.teamJourneyService.initialize();
  }

  ngOnDestroy(): void {
    this.teamJourneyService.dispose();
  }

  get playerTeam(): JourneyRoster | null {
    const teamId = this.teamJourneyService.data?.teamId;

    return teamId ? this.teamById(teamId) : null;
  }

  get opponentTeam(): JourneyRoster | null {
    // Keeps the previous opponent visible while the new detail loads.
    const encounterId = this.teamJourneyService.detail?.encounterId;

    const encounter = this.teamJourneyService.data?.encounters.find(
      (item) => item.encounterId === encounterId,
    );

    return encounter ? this.teamById(encounter.opponentTeamId) : null;
  }

  // Matches the summary to the detail still visible during loading.
  get displayedEncounter(): JourneyEncounterItem | null {
    const encounterId = this.teamJourneyService.detail?.encounterId;

    return (
      this.teamJourneyService.data?.encounters.find(
        (encounter) => encounter.encounterId === encounterId,
      ) ?? null
    );
  }

  teamById(teamId: string): JourneyRoster | null {
    return this.teamJourneyService.data?.teams.find((team) => team.teamId === teamId) ?? null;
  }

  teamName(teamId: string | null): string {
    if (!teamId) {
      return '-';
    }

    const team = this.teamById(teamId);

    if (!team) {
      return teamId;
    }

    const name = team.name.replace(/\s+Team$/i, '').replace(/^Equipo\s+/i, '');

    return this.i18nService.text(`${name} Team`, `Equipo ${name}`);
  }

  heroName(heroId: string | null): string {
    if (!heroId) {
      return '-';
    }

    for (const team of this.teamJourneyService.data?.teams ?? []) {
      const hero = team.heroes.find((item) => item.id === heroId);

      if (hero) {
        return this.cleanHeroName(hero.name);
      }
    }

    return heroId;
  }

  cleanHeroName(name: string): string {
    return name.replace(/^\d+\.\s*/, '');
  }

  targetNames(heroIds: string[]): string {
    return heroIds.map((heroId) => this.heroName(heroId)).join(', ');
  }

  isActiveHero(teamId: string, heroId: string): boolean {
    const activeTeam = this.teamJourneyService.selectedRound?.activeHeroIdsByTeam.find(
      (team) => team.teamId === teamId,
    );

    return activeTeam?.heroIds.includes(heroId) ?? false;
  }

  label(code: string | null): string {
    const labels: Partial<Record<string, AppCopyKey>> = {
      GROUP_STAGE: 'groupStage',
      ROUND_OF_16: 'historyRivals.stage.roundOf16',
      QUARTERFINAL: 'historyRivals.stage.quarterfinal',
      SEMIFINAL: 'historyRivals.stage.semifinal',
      WIN: 'r7.win',
      LOSS: 'r7.loss',
      DRAW: 'r7.draw',
      READY: 'r7.pending',
      VICTORY: 'r7.win',
      DEFEAT: 'r7.loss',
      ABANDON: 'r7.abandoned',
    };
    const key = labels[code ?? ''];

    if (key) {
      return this.i18nService.t(key);
    }

    if (code === 'ACTIVE') {
      return this.i18nService.text('In progress', 'En curso');
    }

    if (code === 'COMPLETED') {
      return this.i18nService.text('Completed', 'Completado');
    }

    return code ?? '-';
  }

  roundLabel(round: JourneyRound): string {
    if (round.roundType === 'EXTRA_ROUND' || round === this.teamJourneyService.detail?.extraRound) {
      return this.i18nService.t('r7.roundType.extra');
    }

    return this.i18nService.t('r7.roundLabel', { number: round.number });
  }

  eventIcon(event: JourneyEvent): string {
    switch (event.eventCode) {
      case 'ACTION':
        return event.values.actionCode === 'SUPPORT_SPECIAL' ? '✦' : '⚔';

      case 'DAMAGE':
        return '✹';

      case 'HEAL':
      case 'RECOVERY':
        return '✚';

      case 'KO':
        return '✕';

      case 'STAT_GAIN':
        return '↑';

      case 'AUTO_PURCHASE_USE':
        return '◇';

      default:
        return '•';
    }
  }

  // Rebuilds the display groups only when the round or language changes.
  get eventGroups(): CombatEventGroup[] {
    const round = this.teamJourneyService.selectedRound;
    const language = this.i18nService.text('en', 'es');

    if (round !== this.groupedRound || language !== this.groupedLanguage) {
      this.groupedRound = round;
      this.groupedLanguage = language;
      this.groups = this.buildEventGroups(round?.events ?? []);
    }

    return this.groups;
  }

  private buildEventGroups(events: JourneyEvent[]): CombatEventGroup[] {
    const groups: CombatEventGroup[] = [];
    let currentAction: CombatEventGroup | null = null;

    for (const event of events) {
      const isEffect = ['DAMAGE', 'HEAL', 'KO', 'STAT_GAIN'].includes(event.eventCode);

      const sameActor =
        currentAction !== null &&
        event.actorHeroId !== null &&
        event.actorHeroId === currentAction.event.actorHeroId;

      const actionTargets = currentAction?.event.targetHeroIds ?? [];

      const sameTargets =
        currentAction !== null &&
        event.targetHeroIds.length > 0 &&
        event.targetHeroIds.every((heroId) => actionTargets.includes(heroId));

      // Groups consecutive effects with the same actor and valid targets.
      if (currentAction && isEffect && sameActor && sameTargets) {
        currentAction.effects.push({
          event,
          text: this.eventText(event, true),
        });

        continue;
      }

      const group: CombatEventGroup = {
        event,
        text: this.eventText(event),
        effects: [],
      };

      groups.push(group);
      currentAction = event.eventCode === 'ACTION' ? group : null;
    }

    for (const group of groups) {
      const effect = group.effects[0];

      if (
        group.effects.length === 1 &&
        effect &&
        effect.event.eventCode === 'DAMAGE' &&
        group.event.targetHeroIds.length === 1 &&
        effect.event.values.amount !== undefined
      ) {
        const amount = effect.event.values.amount;

        group.text =
          group.text.replace(/\.$/, '') +
          this.i18nService.text(` and dealt ${amount} damage.`, ` y causó ${amount} de daño.`);

        group.effects = [];
      } else if (group.effects.length > 0) {
        // The effect lines already identify the affected heroes.
        group.text = this.actionText(group.event, false);
      }
    }

    return groups;
  }

  private actionText(event: JourneyEvent, includeTargets: boolean): string {
    const actions: Record<string, [string, string]> = {
      BASIC_ATTACK: ['a basic attack', 'un ataque básico'],
      OFFENSIVE_SPECIAL: ['an offensive special', 'un especial ofensivo'],
      SUPPORT_SPECIAL: ['a support special', 'un especial de apoyo'],
    };

    const action = actions[event.values.actionCode ?? ''];

    if (!action) {
      return this.narrativeText(event);
    }

    const actor = this.heroName(event.actorHeroId);
    const actionName = this.i18nService.text(action[0], action[1]);
    const targets = includeTargets ? this.targetNames(event.targetHeroIds) : '';

    return (
      this.i18nService.text(`${actor} performed ${actionName}`, `${actor} realizó ${actionName}`) +
      (targets ? this.i18nService.text(` on ${targets}`, ` sobre ${targets}`) : '') +
      '.'
    );
  }

  private eventText(event: JourneyEvent, compact = false): string {
    // Without a published actor, preserve the API narrative.
    if (!event.actorHeroId) {
      return this.narrativeText(event);
    }

    if (event.eventCode === 'ACTION') {
      return this.actionText(event, true);
    }

    const actor = this.heroName(event.actorHeroId);

    const targets = this.targetNames(event.targetHeroIds);
    const amount = event.values.amount;

    if (targets && amount !== undefined) {
      if (event.eventCode === 'DAMAGE') {
        return compact
          ? this.i18nService.text(
              `${targets} receives ${amount} damage.`,
              `${targets} recibe ${amount} de daño.`,
            )
          : this.i18nService.text(
              `${actor} dealt ${amount} damage to ${targets}.`,
              `${actor} causó ${amount} de daño a ${targets}.`,
            );
      }

      if (event.eventCode === 'HEAL') {
        return this.i18nService.text(
          `${targets}: ${amount} energy restored.`,
          `${targets}: ${amount} de energía recuperada.`,
        );
      }
    }

    if (event.eventCode === 'KO' && targets) {
      return this.i18nService.text(`${targets}: knocked out.`, `${targets}: fuera de combate.`);
    }

    return this.narrativeText(event);
  }

  eventTone(event: JourneyEvent): string {
    if (event.eventCode === 'KO') {
      return 'ko';
    }

    if (['HEAL', 'RECOVERY', 'STAT_GAIN'].includes(event.eventCode)) {
      return 'benefit';
    }

    if (
      event.eventCode === 'DAMAGE' ||
      ['BASIC_ATTACK', 'OFFENSIVE_SPECIAL'].includes(event.values.actionCode ?? '')
    ) {
      return 'damage';
    }

    return 'neutral';
  }

  trackEncounter(index: number, encounter: { encounterId: string }): string {
    return encounter.encounterId;
  }

  trackHero(index: number, hero: { id: string }): string {
    return hero.id;
  }

  private narrativeText(event: JourneyEvent): string {
    return (
      event.narrative?.lines.map((line) => line.text).join(' ') ||
      this.i18nService.text(
        `Recorded event: ${event.eventCode}.`,
        `Evento registrado: ${event.eventCode}.`,
      )
    );
  }

  // Caps the delay so long logs become readable quickly.
  entryDelay(index: number, effectIndex = 0): string {
    return `${Math.min(index * 45 + effectIndex * 35, 450)}ms`;
  }
}
