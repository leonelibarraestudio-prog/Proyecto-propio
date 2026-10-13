
import { Component, OnInit } from '@angular/core';
import { HistoryRivalsService } from './service/history-rivals.service';

@Component({
  selector: 'app-history-rivals',
  templateUrl: './history-rivals.component.html',
  styleUrls: ['./history-rivals.component.css'],
  standalone: false,
})
export class HistoryRivalsComponent implements OnInit {
  constructor(
    private readonly historyRivalsService: HistoryRivalsService,
  ) {}

  get viewModel() {
    return this.historyRivalsService.getViewModel();
  }

  ngOnInit(): void {
    this.historyRivalsService.initialize();
  }
  historyRivalsRetry(): void {
  this.historyRivalsService.initialize();
}
}
