import { Component, OnInit } from '@angular/core';
import { FinalPreparationService } from './service/final-preparation.service';
import { InventoryItemView } from './model/final-preparation-api.interface';

@Component({
  selector: 'app-final-preparation',
  templateUrl: './final-preparation.component.html',
  styleUrls: ['./final-preparation.component.css'],
  standalone: false,
})
export class FinalPreparationComponent implements OnInit {
  constructor(private readonly finalpreparationService: FinalPreparationService) {}

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
