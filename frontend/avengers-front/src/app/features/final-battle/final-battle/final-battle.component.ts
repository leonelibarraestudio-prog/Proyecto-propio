import { Component, OnDestroy, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { HeroArtworkResolverService } from '../../../core/services/hero-artwork-resolver.service';
import { FinalBattleService, BattleActionGroup } from './service/final-battle.service';
import { BattleEvent, BattleHero, BattleTeam } from './model/final-battle-api.interface';

@Component({
  selector: 'app-final-battle',
  templateUrl: './final-battle.component.html',
  styleUrls: ['./final-battle.component.css'],
  standalone: false,
})
export class FinalBattleComponent implements OnInit, OnDestroy {
  constructor(
    public readonly battle: FinalBattleService,
    public readonly i18n: I18nService,
    public readonly artwork: HeroArtworkResolverService,
  ) {}

  // Manage the visual action categories.
  commandCategory: 'attack' | 'support' | 'strategy' | 'inventory' = 'attack';

  // Control the visibility of reserve heroes.
  reservesVisible = { player: true, opponent: true };

  // Show or hide reserve heroes.
  toggleReserves(side: 'player' | 'opponent'): void {
    this.reservesVisible[side] = !this.reservesVisible[side];
  }

  // Switch between action categories.
  selectCommandCategory(category: 'attack' | 'support' | 'strategy' | 'inventory'): void {
    if (this.battle.busy || this.battle.status !== 'ready') {
      return;
    }

    // Clear the selected action when changing categories.
    this.onTab(category === 'inventory' ? 'inventory' : 'abilities');
    this.commandCategory = category;
  }

  // Provide localized labels for the battle interface.
  get copy() {
    return {
      title: this.i18n.t('r9.title'),
      refresh: this.i18n.t('r9.refresh'),
      loading: this.i18n.text('Loading battle…', 'Cargando batalla…'),
      refreshing: this.i18n.text('Refreshing battle…', 'Actualizando batalla…'),
      submitting: this.i18n.t('r9.executing'),
      loadError: this.i18n.text('Could not load the battle', 'No se pudo cargar la batalla'),
      operationError: this.i18n.text('Battle operation failed', 'Falló la operación de batalla'),
      retry: this.i18n.text('Retry', 'Reintentar'),
      unavailable: this.i18n.t('r9.noBattleCopy'),
      simulate: this.i18n.text('Simulate battles', 'Simular batallas'),
      result: this.i18n.t('r9.result'),
      beforeStart: this.i18n.text('Prepare your team', 'Prepará tu equipo'),
      start: this.i18n.t('r9.start'),
      strategy: this.i18n.t('r11.strategy'),
      synergy: this.i18n.text('Synergy', 'Sinergia'),
      teamActions: this.i18n.t('r11.teamActions'),
      leaderUses: this.i18n.t('r11.leaderUses'),
      strategyChanges: this.i18n.text('Strategy changes', 'Cambios de estrategia'),
      vacancies: this.i18n.text('Vacant active slots', 'Puestos activos vacantes'),
      noHeroes: this.i18n.text('No heroes available', 'No hay héroes disponibles'),
      returnTurn: this.i18n.text('Returns on turn', 'Regresa en el turno'),
      selectedHero: this.i18n.text('Selected hero', 'Héroe seleccionado'),
      abandon: this.i18n.text('Abandon battle', 'Abandonar batalla'),
      noActions: this.i18n.t('r9.noActions'),
      cost: this.i18n.text('Cost', 'Costo'),
      noItems: this.i18n.t('r9.noInventory'),
      scope: this.i18n.text('Scope', 'Alcance'),
      context: this.i18n.text('Use context', 'Contexto de uso'),
      execute: this.i18n.text('EXECUTE ACTION', 'EJECUTAR ACCIÓN'),
      narrative: this.i18n.t('r9.liveNarrative'),
      turn: this.i18n.t('r9.turn'),
      noEvents: this.i18n.text('No events yet', 'Todavía no hay eventos'),
      energy: this.i18n.t('r11.energy'),
      threat: this.i18n.text('Threat', 'Amenaza'),
    };
  }

  // Load the battle when entering the screen.
  ngOnInit(): void {
    this.battle.initialize();
  }

  // Cancel subscriptions when leaving the screen.
  ngOnDestroy(): void {
    this.battle.dispose();
  }

  // Refresh the battle if the screen is not busy.
  onRefresh(): void {
    if (!this.battle.busy) {
      this.battle.refresh();
    }
  }

  // Select the player's hero.
  onHero(heroId: string): void {
    this.battle.selectHero(heroId);
  }

  // Switch between abilities and inventory.
  onTab(tab: 'abilities' | 'inventory'): void {
    this.battle.selectTab(tab);
  }

  // Select an action group.
  onGroup(group: BattleActionGroup): void {
    this.battle.selectActionGroup(group);
  }

  // Select a specific action option.
  onTarget(actionId: string): void {
    this.battle.selectActionOption(actionId);
  }

  // Execute the selected battle action.
  onExecute(): void {
    this.battle.execute();
  }

  // Ask for confirmation before abandoning the battle.
  onAbandon(): void {
    if (this.battle.busy || !this.battle.data?.canAbandon) {
      return;
    }

    if (window.confirm(this.i18n.text('Abandon this battle?', '¿Abandonar esta batalla?'))) {
      this.battle.abandon();
    }
  }

  // Separate heroes by their published formation status.
  formationGroups(team: BattleTeam) {
    return [
      {
        code: 'ACTIVE',
        label: this.i18n.t('r9.inCombat'),
        heroes: team.heroes.filter((hero) => hero.status === 'ACTIVE'),
      },
      {
        code: 'INACTIVE',
        label: this.i18n.t('r9.reserve'),
        heroes: team.heroes.filter((hero) => hero.status === 'INACTIVE'),
      },
      {
        code: 'OTHER',
        label: this.i18n.text('Other published states', 'Otros estados publicados'),
        heroes: team.heroes.filter((hero) => !['ACTIVE', 'INACTIVE'].includes(hero.status)),
      },
    ].filter((group) => group.code !== 'OTHER' || group.heroes.length > 0);
  }

  // Find a hero's name in either team.
  heroName(heroId: string | null): string {
    for (const team of [this.battle.data?.player, this.battle.data?.opponent]) {
      const hero = team?.heroes.find((entry) => entry.heroId === heroId);

      if (hero) {
        return hero.name;
      }
    }

    return heroId ?? '-';
  }

  // Convert event values into readable text.
  eventValues(event: BattleEvent): string {
    return JSON.stringify(event.values);
  }

  // Help Angular recognize items when lists are updated.
  trackHero(_index: number, hero: BattleHero): string {
    return hero.heroId;
  }

  trackEvent(_index: number, event: BattleEvent): number {
    return event.sequence;
  }

  trackGroup(_index: number, group: BattleActionGroup): string {
    return group.key;
  }
}
