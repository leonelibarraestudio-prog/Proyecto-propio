import { Component, OnDestroy, OnInit } from '@angular/core';

import { I18nService } from '../../../core/services/i18n.service';
import { HeroArtworkResolverService } from '../../../core/services/hero-artwork-resolver.service';

import { TeamJourneyService } from './service/team-journey.service';
import { JourneyEvent, JourneyRoster } from './model/team-journey-api.interface';

@Component({
  selector: 'app-team-journey',
  templateUrl: './team-journey.component.html',
  styleUrls: ['./team-journey.component.css'],
  standalone: false,
})
export class TeamJourneyComponent implements OnInit, OnDestroy {
  constructor(
    public readonly teamJourneyService: TeamJourneyService,
    // Provides translations for the HTML.
    public readonly i18nService: I18nService,
    // Provides hero images for the HTML.
    public readonly artwork: HeroArtworkResolverService,
  ) {}

  // Component initialization.
  ngOnInit(): void {
    this.teamJourneyService.initialize();
  }

  // Component cleanup.
  ngOnDestroy(): void {
    this.teamJourneyService.dispose();
  }

  // Get player team.
  get playerTeam(): JourneyRoster | null {
    const teamId = this.teamJourneyService.data?.teamId;

    return teamId ? this.teamById(teamId) : null;
  }

  // Get opponent team.
  get opponentTeam(): JourneyRoster | null {
    const encounter = this.teamJourneyService.data?.encounters.find(
      (item) => item.encounterId === this.teamJourneyService.selectedEncounterId,
    );

    return encounter ? this.teamById(encounter.opponentTeamId) : null;
  }

  // Get teams to display.
  get displayedTeams(): JourneyRoster[] {
    const teams: JourneyRoster[] = [];

    if (this.playerTeam) {
      teams.push(this.playerTeam);
    }

    if (this.opponentTeam) {
      teams.push(this.opponentTeam);
    }

    return teams;
  }

  // Get initiative leader.
  get initiativeLeaderId(): string | null {
    const teamId = this.teamJourneyService.selectedRound?.initiativeTeamId;

    return teamId ? (this.teamById(teamId)?.leaderId ?? null) : null;
  }

  // Get final status.
  get finalStatusLabel(): string {
    const status = this.teamJourneyService.data?.final?.status;

    return status ?? '-';
  }

  // Find team by ID.
  teamById(teamId: string): JourneyRoster | null {
    return this.teamJourneyService.data?.teams.find((team) => team.teamId === teamId) ?? null;
  }

  // Get team name.
  teamName(teamId: string | null): string {
    return teamId ? (this.teamById(teamId)?.name ?? teamId) : '-';
  }

  // Get hero name.
  heroName(heroId: string | null): string {
    if (!heroId) {
      return '-';
    }

    for (const team of this.teamJourneyService.data?.teams ?? []) {
      const hero = team.heroes.find((item) => item.id === heroId);

      if (hero) {
        return hero.name;
      }
    }

    return heroId;
  }

  // Check if hero is active.
  isActiveHero(teamId: string, heroId: string): boolean {
    const active = this.teamJourneyService.selectedRound?.activeHeroIdsByTeam.find(
      (team) => team.teamId === teamId,
    );

    return active?.heroIds.includes(heroId) ?? false;
  }

  // Get stage label.
  stageLabel(code: string): string {
    const labels: Record<string, [string, string]> = {
      GROUP_STAGE: ['Group stage', 'Fase de grupos'],
      ROUND_OF_16: ['Round of 16', 'Octavos de final'],
      QUARTERFINAL: ['Quarterfinal', 'Cuartos de final'],
      SEMIFINAL: ['Semifinal', 'Semifinal'],
    };

    const label = labels[code];

    return label ? this.i18nService.text(label[0], label[1]) : code;
  }

  // Get result label.
  resultLabel(code: string | null): string {
    if (code === 'WIN') {
      return this.i18nService.text('Win', 'Victoria');
    }

    if (code === 'LOSS') {
      return this.i18nService.text('Loss', 'Derrota');
    }

    if (code === 'DRAW') {
      return this.i18nService.text('Draw', 'Empate');
    }

    return code ?? '-';
  }

  // Order events.
  orderedEvents(events: JourneyEvent[]): JourneyEvent[] {
    return [...events].sort((first, second) => first.sequence - second.sequence);
  }

  // Order narrative lines.
  narrativeLines(event: JourneyEvent) {
    return [...(event.narrative?.lines ?? [])].sort(
      (first, second) => first.lineSequence - second.lineSequence,
    );
  }

  // Scroll timeline.
  scrollTimeline(container: HTMLElement, direction: number): void {
    container.scrollBy({
      left: direction * 250,
      behavior: 'smooth',
    });
  }
}
