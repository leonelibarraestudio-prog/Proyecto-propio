
import { Component, OnInit } from '@angular/core';
import {
  HistoryRivalsEncounter,
  HistoryRivalsHero,
  HistoryRivalsService,
  HistoryRivalsTeam,
} from './service/history-rivals.service';

@Component({
  selector: 'app-history-rivals',
  templateUrl: './history-rivals.component.html',
  styleUrls: ['./history-rivals.component.css'],
  standalone: false,
})
export class HistoryRivalsComponent implements OnInit {
  selectedHeroId: string | null = null;
  selectedRivalId: string | null = null;

  constructor(
    private readonly historyRivalsService: HistoryRivalsService,
  ) {}

  get viewModel() {
    return this.historyRivalsService.getViewModel();
  }

  get selectedAttemptId(): string | null {
    return this.historyRivalsService.selectedAttemptId;
  }

  get selectedHero(): HistoryRivalsHero | undefined {
    return this.viewModel.data?.heroes.find(
      (hero) => hero.id === this.selectedHeroId,
    );
  }

  get availableRivals(): string[] {
    return this.selectedHero?.rivals ?? [];
  }

  get filteredEncounters(): HistoryRivalsEncounter[] {
    const data = this.viewModel.data;

    if (!data || !this.selectedHeroId || !this.selectedRivalId) {
      return [];
    }

    const teams = data.teams ?? [];

    return data.encounters.filter((encounter) => {
      const teamA = teams.find(
        (team) => team.teamId === encounter.teamAId,
      );
      const teamB = teams.find(
        (team) => team.teamId === encounter.teamBId,
      );

      if (!teamA || !teamB) {
        return false;
      }

      const heroInA = teamA.heroIds.includes(this.selectedHeroId!);
      const heroInB = teamB.heroIds.includes(this.selectedHeroId!);
      const rivalInA = teamA.heroIds.includes(this.selectedRivalId!);
      const rivalInB = teamB.heroIds.includes(this.selectedRivalId!);

      return (
        (heroInA && rivalInB) ||
        (heroInB && rivalInA)
      );
    });
  }

  get selectedHeroName(): string {
    return (
      this.selectedHero?.name ??
      this.selectedHeroId ??
      'Héroe'
    );
  }

  ngOnInit(): void {
    this.historyRivalsService.initialize();
  }

  historyRivalsRetry(): void {
    this.selectedHeroId = null;
    this.selectedRivalId = null;
    this.historyRivalsService.initialize();
  }

  selectJourney(attemptId: string): void {
    this.selectedHeroId = null;
    this.selectedRivalId = null;
    this.historyRivalsService.selectJourney(attemptId);
  }

  selectHero(heroId: string): void {
    this.selectedHeroId = heroId;
    this.selectedRivalId = null;
  }

  selectRival(rivalId: string): void {
    this.selectedRivalId = rivalId;
  }

  getTeamName(teamId: string): string {
    const teams: HistoryRivalsTeam[] =
      this.viewModel.data?.teams ?? [];

    return teams.find((team) => team.teamId === teamId)?.name ?? teamId;
  }

  getTeamDamage(
    encounter: HistoryRivalsEncounter,
    teamId: string,
  ): number | null {
    const damage = encounter.damageByTeam?.find(
      (item) => item.teamId === teamId,
    );

    return damage?.damageDealt ?? null;
  }

  getHeroImage(heroId: string): string {
    const normalizedId = heroId.toLowerCase().replace(/\s+/g, '-');

    return `assets/portraits/${normalizedId}-portrait.webp`;
  }

  onHeroImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = 'assets/heroes/default-hero.svg';
  }
}
