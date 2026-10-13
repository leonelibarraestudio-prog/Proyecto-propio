import { Component, OnInit } from '@angular/core';
import { TeamConfigService } from './service/team-config.service';

@Component({
  selector: 'app-team-config',
  templateUrl: './team-config.component.html',
  styleUrls: ['./team-config.component.css'],
  standalone: false,
})
export class TeamConfigComponent implements OnInit {
  teamConfigData: any = null;
  errorMessage: string = '';

  constructor(private readonly teamConfigService: TeamConfigService) {}

  ngOnInit(): void {
    this.teamConfigService.getTeamConfig().subscribe({
      next: (data) => {
        this.teamConfigData = data;
      },
      error: (err) => {
        console.error('Error al obtener la configuración:', err);
        this.errorMessage = 'No se pudo cargar la configuración del equipo.';
      }
    });
  }
}