import { Component, OnInit } from '@angular/core';
import { TeamStatusService } from './service/team-status.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TeamStatusHeroModel, TeamStatusTeamModel } from './model/team-status-api.model';

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
        label: this.i18n.t('r11.active'),
        heroes: team.heroes.filter((hero) => hero.status === 'ACTIVE'),
      },
      {
        code: 'INACTIVE',
        label: this.i18n.t('r11.reserve'),
        heroes: team.heroes.filter((hero) => hero.status === 'INACTIVE'),
      },
      {
        code: 'OTHER',
        label: this.i18n.t('status'),
        heroes: team.heroes.filter(
          (hero) => hero.status !== 'ACTIVE' && hero.status !== 'INACTIVE',
        ),
      },
    ].filter((group) => group.heroes.length > 0);
  }

  conditionLabel(code: string): string {
    if (code === 'AVAILABLE') {
      return this.i18n.t('r11.available');
    }
    if (code === 'KO') {
      return this.i18n.t('r11.knockedOut');
    }
    return code;
  }

  trackHero(_index: number, hero: TeamStatusHeroModel): string {
    return hero.heroId;
  }

  trackGroup(_index: number, group: { code: string }): string {
    return group.code;
  }

  codeLabel(code: string): string {
    switch (code) {
      case 'READY':
        return this.i18n.text('Ready', 'Lista para iniciar');
      case 'ACTIVE':
        return this.i18n.text('Active', 'En curso');
      case 'COMPLETED':
        return this.i18n.text('Completed', 'Completada');
      case 'AWAITING_START':
        return this.i18n.text('Awaiting start', 'Esperando inicio');
      case 'AWAITING_PLAYER_ACTION':
        return this.i18n.text('Awaiting player action', 'Esperando acción del jugador');
      case 'BALANCED':
        return this.i18n.text('Balanced', 'Equilibrada');
      case 'AGGRESSIVE':
        return this.i18n.text('Aggressive', 'Agresiva');
      case 'DEFENSIVE':
        return this.i18n.text('Defensive', 'Defensiva');
      case 'HIGH':
        return this.i18n.text('High', 'Alta');
      case 'MEDIUM':
        return this.i18n.text('Medium', 'Media');
      case 'LOW':
        return this.i18n.text('Low', 'Baja');
      case 'VICTORY':
        return this.i18n.text('Victory', 'Victoria');
      case 'DEFEAT':
        return this.i18n.text('Defeat', 'Derrota');
      case 'ABANDON':
        return this.i18n.text('Abandonment', 'Abandono');
      case 'PLAYER_ABANDONED':
        return this.i18n.text('Player abandoned', 'El jugador abandonó');
      default:
        return code;
    }
  }
}
