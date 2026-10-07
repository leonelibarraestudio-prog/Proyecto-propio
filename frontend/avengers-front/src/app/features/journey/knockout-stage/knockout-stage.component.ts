import { Component, OnInit } from '@angular/core';
import { KnockoutStageApi } from './model/knockout-stage-api.interface';
import { KnockoutStageService } from './service/knockout-stage.service';

@Component({
  selector: 'app-knockout-stage',
  templateUrl: './knockout-stage.component.html',
  styleUrls: ['./knockout-stage.component.css'],
  standalone: false,
})
export class KnockoutStageComponent implements OnInit {
  constructor(private readonly knockoutStageService: KnockoutStageService) {}

  ngOnInit(): void {
    this.knockoutStageService.initialize();
  }

  get data(): KnockoutStageApi | null {
    return this.knockoutStageService.getKnockoutStage();
  }
}