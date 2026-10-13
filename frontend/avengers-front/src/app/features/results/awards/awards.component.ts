
import { Component, OnInit } from '@angular/core';
import { AwardsService } from './service/awards.service';

@Component({
  selector: 'app-awards',
  templateUrl: './awards.component.html',
  styleUrls: ['./awards.component.css'],
  standalone: false,
})
export class AwardsComponent implements OnInit {
  response: unknown = null;
  loading = true;
  error = '';

  constructor(private readonly awardsService: AwardsService) {}

  ngOnInit(): void {
    this.awardsService.getAwards().subscribe({
      next: (result) => {
        console.log('Respuesta de premios:', result);
        this.response = result.data;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Error al cargar premios:', err);

        const apiError = err as {
          message?: string;
          error?: { message?: string };
        };

        this.error =
          apiError?.error?.message ??
          apiError?.message ??
          'No se pudo obtener la respuesta del backend.';

        this.loading = false;
      },
    });
  }
}
