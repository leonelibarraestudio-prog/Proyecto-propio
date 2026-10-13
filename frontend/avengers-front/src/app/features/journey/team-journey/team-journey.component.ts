import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { TeamJourneyService } from './service/team-journey.service';

@Component({
  selector: 'app-team-journey',
  templateUrl: './team-journey.component.html',
  styleUrls: ['./team-journey.component.css'],
  standalone: false,
})
export class TeamJourneyComponent implements OnInit {
  constructor(
    public readonly teamJourneyService: TeamJourneyService,
    // Provides translations for the HTML.
    public readonly i18nService: I18nService,
  ) {}

  ngOnInit(): void {
    this.teamJourneyService.initialize();
  }
}
