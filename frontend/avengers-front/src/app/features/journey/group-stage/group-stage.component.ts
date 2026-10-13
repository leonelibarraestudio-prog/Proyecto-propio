import { Component, OnInit } from '@angular/core';
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
  constructor(private readonly groupstageService: GroupStageService) {}

  get estadoDeLaFaseDeGrupos(): EstadoVistaFaseDeGrupos {
    return this.groupstageService.obtenerEstadoDeLaFaseDeGrupos();
  }

  ngOnInit(): void {
    this.groupstageService.initialize();
  }
}
