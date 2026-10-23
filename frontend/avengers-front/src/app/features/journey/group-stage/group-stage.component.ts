import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { GrupoDeLaFaseApi } from './model/etapas-del-journey-api.interface';
import {
  EstadoVistaFaseDeGrupos,
  GroupStageService,
} from './service/group-stage.service';

@Component({
  selector: 'app-group-stage',
  templateUrl: './group-stage.component.html',
  styleUrls: ['./group-stage.component.css'],
  standalone: false,
})
export class GroupStageComponent implements OnInit {
  constructor(
    private readonly groupstageService: GroupStageService,
    public readonly i18nService: I18nService,
  ) {}

  get estadoDeLaFaseDeGrupos(): EstadoVistaFaseDeGrupos {
    return this.groupstageService.obtenerEstadoDeLaFaseDeGrupos();
  }

  get grupoSeleccionado(): GrupoDeLaFaseApi | null {
    const datosFaseDeGrupos = this.estadoDeLaFaseDeGrupos.datosFaseDeGrupos;
    const idDelGrupoSeleccionado = this.estadoDeLaFaseDeGrupos.idDelGrupoSeleccionado;

    return (
      datosFaseDeGrupos?.groupStage.groups.find(
        (grupo) => grupo.groupId === idDelGrupoSeleccionado,
      ) ?? null
    );
  }

  get esGrupoDelEquipo(): boolean {
    return this.grupoSeleccionado?.standings.some((posicion) => posicion.esMiEquipo) ?? false;
  }

  get esErrorDeJourney(): boolean {
    return this.estadoDeLaFaseDeGrupos.errorCode === 'JOURNEY_REQUIRED';
  }

  ngOnInit(): void {
    this.groupstageService.initialize();
  }

  cambiarGrupo(event: Event): void {
    const selectorDeGrupo = event.target as HTMLSelectElement;
    this.groupstageService.seleccionarGrupo(selectorDeGrupo.value);
  }

  reintentar(): void {
    this.groupstageService.initialize();
  }

  obtenerResultadoVisible(codigoDelResultado: string): string {
    if (codigoDelResultado === 'DRAW') {
      return this.i18nService.t('r5.draw');
    }
    if (codigoDelResultado === 'WIN') {
      return this.i18nService.text('WIN', 'GANO');
    }
    if (codigoDelResultado === 'LOSS') {
      return this.i18nService.text('LOSS', 'PERDIO');
    }
    return codigoDelResultado;
  }
}
