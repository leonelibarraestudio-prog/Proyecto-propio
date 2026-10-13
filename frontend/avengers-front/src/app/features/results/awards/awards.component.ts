
import { Component, OnInit } from '@angular/core';
import { AwardsService } from './service/awards.service';
import type { Award } from './service/awards.service';

@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.css'],
  standalone: false,
})
export class AwardsComponent implements OnInit {
  awards: Award[] = [];

  loading = true;

  error = '';

  constructor(private readonly awardsService: AwardsService) {}

  ngOnInit(): void {
    this.awardsService.getAwards().subscribe({
      next: (response) => {
        this.awards = response?.data?.awards ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los premios. Intentá nuevamente.';
        this.loading = false;
      },
    });
  }
}
