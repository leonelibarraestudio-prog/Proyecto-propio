
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

  get selectedHeroName(): string {
    return (
      this.selectedHero?.name ??
      this.selectedHeroId ??
      'Héroe'
    );
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

  ngOnInit(): void {
    this.historyRivalsService.initialize();
  }

  historyRivalsRetry(): void {
    this.historyRivalsService.initialize();
  }

selectJourney(attemptId: string): void {
  this.selectedHeroId = null;
  this.selectedRivalId = null;
  this.historyRivalsService.selectJourney(attemptId);
}

selectCurrentJourney(): void {
  this.selectedHeroId = null;
  this.selectedRivalId = null;
  this.historyRivalsService.initialize();
}

  selectHero(heroId: string): void {
    this.selectedHeroId = heroId || null;
    this.selectedRivalId = null;
  }

  selectRival(rivalId: string): void {
    this.selectedRivalId = rivalId || null;
  }

  /**
   * Devuelve el nombre legible de un rival.
   * Si el backend no envía su nombre, conserva el identificador.
   */
  getRivalName(
    rivalId: string,
    hero?: HistoryRivalsHero,
  ): string {
    if (!rivalId) {
      return 'Rival no disponible';
    }

    const selectedHero = hero ?? this.selectedHero;

    const rivalName = selectedHero?.rivalNames?.[rivalId];

    if (rivalName) {
      return rivalName;
    }

    const catalogHero = this.viewModel.data?.heroes.find(
      (item) => item.id === rivalId,
    );

    return catalogHero?.name ?? rivalId;
  }

  getTeamName(teamId: string): string {
    const teams: HistoryRivalsTeam[] =
      this.viewModel.data?.teams ?? [];

    return (
      teams.find((team) => team.teamId === teamId)?.name ??
      teamId
    );
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

  translateCode(code: string | null | undefined): string {
    if (!code) {
      return 'No disponible';
    }

    const translations: Record<string, string> = {
      SAVE: 'Conservar recursos',
      BALANCED: 'Equilibrada',
      AGGRESSIVE: 'Agresiva',
      VICTORY: 'Victoria',
      DEFEAT: 'Derrota',
      ABANDON: 'Abandono',
      WIN: 'Victoria',
      LOSS: 'Derrota',
      DRAW: 'Empate',
      ROUND_OF_16: 'Octavos de final',
      QUARTERFINAL: 'Cuartos de final',
      QUARTER_FINAL: 'Cuartos de final',
      SEMIFINAL: 'Semifinal',
      SEMI_FINAL: 'Semifinal',
      FINAL: 'Final',
      GROUP_STAGE: 'Fase de grupos',
      NORMAL: 'Normal',
      TECHNICAL_VERDICT: 'Veredicto técnico',
      PRE_FINAL: 'Antes de la final',
      IN_PROGRESS: 'En curso',
      COMPLETED: 'Completado',
      ELIMINATED: 'Eliminado',
      RIVAL: 'Rival',
      RIVAL_ENCOUNTER: 'Encuentro entre rivales',
      NO_CONTEST: 'Sin resultado',
      BFF_TEAM_CONTEXT_UNAVAILABLE:
        'No se pudo cargar el equipo configurado',
      BFF_TEAM_CONFIGURATION_UNAVAILABLE:
        'No se pudo cargar la configuración del equipo',
      BFF_HERO_ROSTER_UNAVAILABLE:
        'No se pudo cargar el plantel de héroes',
      BFF_JOURNEY_UNAVAILABLE:
        'No se pudo cargar el Journey',
    };

    if (translations[code]) {
      return translations[code];
    }

    return code
      .toLowerCase()
      .split('_')
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(' ');
  }
}

