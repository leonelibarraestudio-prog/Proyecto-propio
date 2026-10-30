import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import {
  FinalPreparationApi,
  InventoryItemView,
  PowerUpApi,
  PreparationHero,
  StrategyOption,
} from './model/final-preparation-api.interface';
import {
  FinalPreparationService,
  FinalPreparationViewModel,
} from './service/final-preparation.service';

@Component({
  selector: 'app-final-preparation',
  templateUrl: './final-preparation.component.html',
  styleUrls: ['./final-preparation.component.css'],
  standalone: false,
})
export class FinalPreparationComponent implements OnInit {
  // Inventory item waiting for the person to choose a Hero target.
  selectedItem: InventoryItemView | null = null;

  // Unsaved choices. null means "nothing changed, use what the server says".
  draftActiveIds: string[] | null = null;

  draftStrategy: string | null = null;

  // Short confirmation shown after a successful operation.
  notice: string | null = null;

  constructor(
    private readonly finalPreparationService: FinalPreparationService,
    public readonly i18n: I18nService,
  ) {}

  get pageState(): FinalPreparationViewModel {
    return this.finalPreparationService.getViewModel();
  }

  ngOnInit(): void {
    this.finalPreparationService.initialize();
  }

  // ----- Store -----

  buy(itemId: string): void {
    this.notice = null;
    this.finalPreparationService.purchase(itemId, () => {
      this.notice = this.i18n.t('r8.purchaseSuccess');
    });
  }

  // ----- Inventory -----

  startUse(item: InventoryItemView): void {
    this.notice = null;
    if (item.targetScope === 'TEAM') {
      this.finalPreparationService.useItem(item.itemId, undefined, () => this.showItemUsed());
      return;
    }
    this.selectedItem = item;
  }

  useOn(heroId: string): void {
    if (!this.selectedItem) {
      return;
    }
    const itemId = this.selectedItem.itemId;
    this.selectedItem = null;
    this.finalPreparationService.useItem(itemId, heroId, () => this.showItemUsed());
  }

  cancelUse(): void {
    this.selectedItem = null;
  }

  // ----- Formation and strategy -----

  isActive(hero: PreparationHero): boolean {
    return this.draftActiveIds
      ? this.draftActiveIds.includes(hero.heroId)
      : hero.status === 'ACTIVE';
  }

  toggleActive(hero: PreparationHero, heroes: PreparationHero[]): void {
    const current = this.draftActiveIds ?? this.activeIds(heroes);
    this.draftActiveIds = current.includes(hero.heroId)
      ? current.filter((id) => id !== hero.heroId)
      : [...current, hero.heroId];
  }

  selectStrategy(event: Event): void {
    this.draftStrategy = (event.target as HTMLSelectElement).value;
  }

  isStrategySelected(option: StrategyOption, preparation: FinalPreparationApi): boolean {
    return option.code === (this.draftStrategy ?? preparation.strategyCode);
  }

  saveFormation(preparation: FinalPreparationApi): void {
    this.notice = null;
    this.finalPreparationService.savePreparation(
      this.draftActiveIds ?? this.activeIds(preparation.heroes),
      this.draftStrategy ?? preparation.strategyCode,
      () => {
        this.draftActiveIds = null;
        this.draftStrategy = null;
        this.notice = this.i18n.t('r8.preparationSaved');
      },
    );
  }

  // ----- Template helpers -----

  scopeLabel(scope: 'HERO' | 'TEAM'): string {
    return scope === 'HERO' ? this.i18n.text('Hero', 'Héroe') : this.i18n.text('Team', 'Equipo');
  }

  trackByHero(_index: number, hero: PreparationHero): string {
    return hero.heroId;
  }

  trackByInventoryItem(_index: number, item: InventoryItemView): string {
    return item.itemId;
  }

  trackByPowerUp(_index: number, item: PowerUpApi): string {
    return item.id;
  }

  trackByStrategy(_index: number, option: StrategyOption): string {
    return option.code;
  }

  private showItemUsed(): void {
    this.notice = this.i18n.text('Item used.', 'Objeto usado.');
  }

  private activeIds(heroes: PreparationHero[]): string[] {
    return heroes.filter((hero) => hero.status === 'ACTIVE').map((hero) => hero.heroId);
  }
}
