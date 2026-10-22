import { Component, OnInit } from '@angular/core';
import { AwardsService } from './service/awards.service';
import type { Award, AwardsResponse } from './service/awards.service';

@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.css'],
  standalone: false,
})
export class AwardsComponent implements OnInit {
  awards: Award[] = [];
  response: AwardsResponse | null = null;
  loading = true;
  error = '';

  constructor(private readonly awardsService: AwardsService) {}

  ngOnInit(): void {
    this.awardsService.getAwards().subscribe({
      next: (result) => {
        this.response = result.data;
        this.awards = result.data?.awards ?? [];
        this.loading = false;
      },
      error: (err: unknown) => {
        const apiError = err as {
          message?: string;
          error?: { message?: string };
        };

        this.error =
          apiError?.error?.message ??
          apiError?.message ??
          'No se pudieron cargar los premios.';

        this.loading = false;
      },
    });
  }
}
