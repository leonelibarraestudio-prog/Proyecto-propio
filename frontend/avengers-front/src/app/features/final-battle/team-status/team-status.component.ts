import { Component, OnInit } from '@angular/core';
import { TeamStatusService } from './service/team-status.service';
import { I18nService } from '../../../core/services/i18n.service';
import {
  TeamStatusHeroModel,
  TeamStatusTeamModel,
} from './model/team-status-api.model';

@Component({
  selector: 'app-team-status',
  templateUrl: './team-status.component.html',
  styleUrls: ['./team-status.component.css'],
  standalone: false,
})
export class TeamStatusComponent implements OnInit {
  constructor(
    private readonly teamstatusService: TeamStatusService,
    public readonly i18n: I18nService,
  ) {}

  get pageState() {
    return this.teamstatusService.getViewModel();
  }

  ngOnInit(): void {
    this.teamstatusService.initialize();
  }

  onRefresh(): void {
    this.teamstatusService.initialize();
  }

  formationGroups(team: TeamStatusTeamModel) {
    return [
      {
        code: 'ACTIVE',
        label: 'En combate',
        heroes: team.heroes.filter((hero) => hero.status === 'ACTIVE'),
      },
      {
        code: 'INACTIVE',
        label: 'Reserva',
        heroes: team.heroes.filter((hero) => hero.status === 'INACTIVE'),
      },
      {
        code: 'OTHER',
        label: 'Otros estados de formación',
        heroes: team.heroes.filter(
          (hero) => hero.status !== 'ACTIVE' && hero.status !== 'INACTIVE',
        ),
      },
    ].filter((group) => group.heroes.length > 0);
  }

  conditionLabel(code: string): string {
    switch (code) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'KO':
      case 'KNOCKED_OUT':
        return 'Fuera de combate';
      default:
        return 'Condición sin descripción disponible';
    }
  }

  trackHero(_index: number, hero: TeamStatusHeroModel): string {
    return hero.heroId;
  }

  trackGroup(_index: number, group: { code: string }): string {
    return group.code;
  }

  codeLabel(code: string | null | undefined): string {
    switch (code) {
      case 'READY':
        return 'Lista para iniciar';
      case 'ACTIVE':
        return 'En curso';
      case 'COMPLETED':
        return 'Completada';
      case 'AWAITING_START':
        return 'Esperando inicio';
      case 'AWAITING_PLAYER_ACTION':
        return 'Esperando acción del jugador';
      case 'BALANCED':
        return 'Equilibrada';
      case 'AGGRESSIVE':
        return 'Agresiva';
      case 'DEFENSIVE':
        return 'Defensiva';
      case 'PRAGMATIC':
        return 'Pragmática';
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Media';
      case 'LOW':
        return 'Baja';
      case 'VICTORY':
        return 'Victoria';
      case 'DEFEAT':
        return 'Derrota';
      case 'ABANDON':
        return 'Abandono';
      case 'PLAYER_ABANDONED':
        return 'El jugador decidió abandonar la batalla.';
      case 'FINAL_RESPONSE_FAILED':
        return 'La respuesta final del equipo no logró superar el desafío.';
      case 'FINAL_RESPONSE_SUCCEEDED':
        return 'La respuesta final del equipo superó el desafío.';
      case 'DOOM_DEFEATED':
        return 'Doctor Doom fue derrotado.';
      case 'SUE_STORM_APPEAL':
        return 'La intervención de Sue Storm resolvió la batalla.';
      case 'PLAYER_NO_LEGAL_PROGRESS':
        return 'El equipo ya no disponía de acciones permitidas para continuar.';
      default:
        return 'Información sin descripción disponible';
    }
  }

  teamNameLabel(name: string): string {
  const readableName = name.trim();

  if (!readableName) {
    return 'Nombre del equipo no disponible';
  }

  return readableName.endsWith(' Team')
    ? `Equipo ${readableName.slice(0, -5)}`
    : readableName;
}
}