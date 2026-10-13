import { Component, OnInit } from '@angular/core';
import { LiveEventsViewModel } from './model/live-events-view-model.interface';
import { LiveEventsService } from './service/live-events.service';

@Component({
  selector: 'app-live-events',
  templateUrl: './live-events.component.html',
  styleUrls: ['./live-events.component.css'],
  standalone: false,
})
export class LiveEventsComponent implements OnInit {
  constructor(private readonly liveEventsService: LiveEventsService) {}

  get pageState(): LiveEventsViewModel {
    return this.liveEventsService.getViewModel();
  }

  ngOnInit(): void {
    this.liveEventsService.initialize();
  }
}