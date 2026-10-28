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
