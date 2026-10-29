
import { Component, OnInit } from '@angular/core';
import { AwardsService } from './service/awards.service';
import type { Award, AwardsResponse, HeroRosterItem } from './service/awards.service';
import { HeroArtworkResolverService } from '../../../core/services/hero-artwork-resolver.service';

@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.css'],
  standalone: false,
})
export class AwardsComponent implements OnInit {
  awards: Award[] = [];

  response: AwardsResponse | null = null;

  heroes: HeroRosterItem[] = [];

  loading = true;

  error = '';

  unavailable = false;

  constructor(
    private readonly awardsService: AwardsService,
    private readonly artwork: HeroArtworkResolverService,
  ) {}

  ngOnInit(): void {
    this.loadAwards();
    this.loadHeroes();
  }

  loadAwards(): void {
    this.loading = true;
    this.error = '';
    this.unavailable = false;

    this.awardsService.getAwards().subscribe({
      next: (result) => {
        this.response = result.data;
        this.awards = result.data?.awards ?? [];
        this.loading = false;
      },
      error: (err: unknown) => {
        const apiError = err as {
          message?: string;
          messageCode?: string;
          error?: {
            message?: string;
            responseMessage?: {
              message?: string;
              messageCode?: string;
            };
          };
        };

        const code =
          apiError?.error?.responseMessage?.messageCode ??
          apiError?.messageCode ??
          '';

        const message =
          apiError?.error?.responseMessage?.message ??
          apiError?.error?.message ??
          apiError?.message ??
          '';

        this.unavailable =
          code.toUpperCase().includes('STATISTICS_UNAVAILABLE') ||
          code.toUpperCase().includes('JOURNEY_INCOMPLETE') ||
          /not available|incomplete|no completed journey|estadístic|incomplet/i.test(message);

        this.error = this.unavailable
          ? 'Las estadísticas y los premios oficiales estarán disponibles cuando la Batalla Final termine en victoria, derrota o abandono.'
          : message || 'No se pudieron consultar las estadísticas y los premios.';

        this.loading = false;
      },
    });
  }

  private loadHeroes(): void {
    this.awardsService.getHeroes().subscribe({
      next: (result) => {
        this.heroes = result.data?.heroes ?? [];
      },
      error: () => {
        this.heroes = [];
      },
    });
  }

  heroName(heroId: string): string {
    return this.heroes.find((hero) => hero.id === heroId)?.displayName ?? heroId;
  }

  portraitPath(heroId: string): string {
    return this.artwork.portraitPath(heroId);
  }

  imageError(event: Event): void {
    this.artwork.useFallback(event);
  }

  awardTitle(code?: string, label?: string): string {
    const titles: Record<string, string> = {
      MIGHTIEST_HERO: 'Héroe más poderoso',
      BEST_SUPPORT: 'Mejor apoyo',
      MOST_RESILIENT: 'Héroe más resistente',
      JOURNEY_MVP: 'Jugador más valioso del Journey',
      VIAJE_MVP: 'Jugador más valioso del Journey',
    };

    return (code && titles[code]) || label || 'Premio oficial';
  }

  metricLabel(code?: string): string {
    if (!code) return 'Métrica';

    const labels: Record<string, string> = {
      damageDealt: 'Daño infligido',
      DAMAGE_DEALT: 'Daño infligido',
      DAÑO_INFRACTADO: 'Daño infligido',
      damageReceived: 'Daño recibido',
      DAMAGE_RECEIVED: 'Daño recibido',
      healing: 'Curación',
      HEALING: 'Curación',
      kosCaused: 'KO causados',
      KOS_CAUSED: 'KO causados',
      kosSuffered: 'KO sufridos',
      KOS_SUFFERED: 'KO sufridos',
      activeEncounters: 'Encuentros activos',
      ACTIVE_ENCOUNTERS: 'Encuentros activos',
      activeRounds: 'Rondas activas',
      ACTIVE_ROUNDS: 'Rondas activas',
      winningActiveRounds: 'Rondas activas ganadas',
      WINNING_ACTIVE_ROUNDS: 'Rondas activas ganadas',
      koRate: 'Tasa de KO',
      KO_RATE: 'Tasa de KO',
    };

    return labels[code] ?? code.replaceAll('_', ' ');
  }

  metricValue(award: Award): string | number | null {
    const facts = award.winningFacts;

    if (!facts) return null;

    if (facts.value !== undefined && facts.value !== null) {
      return facts.value;
    }

    const code = facts.metricCode;
    if (code && facts[code] !== undefined && facts[code] !== null) {
      return facts[code] as string | number;
    }

    return null;
  }

  hasTeamStatistics(): boolean {
    return !!this.response?.teamStatistics?.length;
  }

  teamStat(
    key: keyof NonNullable<AwardsResponse['teamStatistics']>[number],
  ): number | string {
    const statistics = this.response?.teamStatistics ?? [];
    const playerTeamId = this.response?.playerTeamId;

    const playerStats =
      statistics.find((team) => team.teamId === playerTeamId) ??
      statistics[0];

    const value = playerStats?.[key];

    return typeof value === 'number' || typeof value === 'string' ? value : '—';
  }

  outcomeLabel(outcome?: string): string {
    const labels: Record<string, string> = {
      VICTORY: 'Victoria',
      DEFEAT: 'Derrota',
      ABANDON: 'Abandono',
    };

    return outcome ? labels[outcome] ?? outcome : 'No informado';
  }

  endingReasonLabel(code?: string | null): string {
    const labels: Record<string, string> = {
      PLAYER_ABANDONED: 'El jugador abandonó la aventura.',
    };

    return code
      ? labels[code] ?? code.replaceAll('_', ' ')
      : 'No informado';
  }

  endingCodeLabel(code?: string): string {
    const labels: Record<string, string> = {
      POST_REVEAL_ABANDON: 'Abandono posterior a la revelación.',
    };

    return code
      ? labels[code] ?? code.replaceAll('_', ' ')
      : 'No informado';
  }

  hasAnyStatistics(): boolean {
    return !!(
      this.response?.teamStatistics?.length ||
      this.response?.heroStatistics?.length ||
      this.response?.competition
    );
  }
}
