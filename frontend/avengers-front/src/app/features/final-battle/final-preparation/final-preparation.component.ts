import { Component, OnInit } from '@angular/core';
import { FinalPreparationService } from './service/final-preparation.service';
import { 
  InventoryItemView, 
  PreparationHero,
  FinalPreparationApi 
} from './model/final-preparation-api.interface';
import { I18nService } from 'src/app/core/services/i18n.service';


@Component({
  selector: 'app-final-preparation',
  templateUrl: './final-preparation.component.html',
  styleUrls: ['./final-preparation.component.css'],
  standalone: false,
})
export class FinalPreparationComponent implements OnInit {
  constructor(
  private readonly finalpreparationService: FinalPreparationService,
  public readonly i18n: I18nService,
) {}

  get pageState() {
  return this.finalpreparationService.getViewModel();
}

  buy(itemId: string): void {
    this.finalpreparationService.purchase(itemId);
  }

  ngOnInit(): void {
    this.finalpreparationService.initialize();
  }

  selectedItem: InventoryItemView | null = null;

startUse(item: InventoryItemView): void {
  if (item.targetScope === 'TEAM') {
    this.finalpreparationService.useItem(item.itemId);
    return;
  }
  this.selectedItem = item;
}

draftActiveIds: string[] | null = null;
draftStrategy: string | null = null;

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

saveFormation(preparation: FinalPreparationApi): void {
  this.finalpreparationService.savePreparation(
    this.draftActiveIds ?? this.activeIds(preparation.heroes),
    this.draftStrategy ?? preparation.strategyCode,
    () => {
      this.draftActiveIds = null;
      this.draftStrategy = null;
    },
  );
}

private activeIds(heroes: PreparationHero[]): string[] {
  return heroes.filter((hero) => hero.status === 'ACTIVE').map((hero) => hero.heroId);
}

useOn(heroId: string): void {
  if (!this.selectedItem) {
    return;
  }
  this.finalpreparationService.useItem(this.selectedItem.itemId, heroId);
  this.selectedItem = null;
}

cancelUse(): void {
  this.selectedItem = null;
}
}
