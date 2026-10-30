
import {
  AfterViewChecked,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { KnockoutStageMatch, KnockoutStageApi } from './model/knockout-stage-api.interface';
import { KnockoutStageService } from './service/knockout-stage.service';

@Component({
  selector: 'app-knockout-stage',
  templateUrl: './knockout-stage.component.html',
  styleUrls: ['./knockout-stage.component.css'],
  standalone: false,
})
export class KnockoutStageComponent
  implements OnInit, AfterViewChecked, OnDestroy {


  readonly stageOptions = [
    { value: -1, label: 'TODAS' }, { value: 0, label: 'OCTAVOS' },
    { value: 1, label: 'CUARTOS' }, { value: 2, label: 'SEMIFINALES' },
    { value: 3, label: 'FINAL' }
  ];
  selectedStage = -1;
  readonly particles = Array.from({ length: 16 }, (_, i) => ({
    x: `${(i * 37 + 11) % 97}%`, size: `${2.3 + (i % 5) * 0.57}px`,
    duration: `${2.6 + (i % 7) * 0.31}s`, delay: `${-((i * 13) % 40) / 10}s`
  }));
  selectStage(stage: number): void { this.selectedStage = stage; this.lastGeometry = ''; this.scheduleConnections(); }
  get selectedMatches(): KnockoutStageMatch[] {
    if (this.selectedStage < 0 || this.selectedStage > 2) return [];
    const code = ['ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL'][this.selectedStage];
    return this.data?.rounds?.find(round => round.stageCode === code)?.matches ?? [];
  }
  get finalStatus(): string | null { return this.knockoutStageService.getTeamJourney()?.final?.status ?? null; }
  get finalOutcome(): string | null { return this.knockoutStageService.getTeamJourney()?.final?.outcome ?? null; }
  isFalconMatch(match: KnockoutStageMatch): boolean {
    const playerId = this.data?.teamId;
    return !!playerId && (match.teamAId === playerId || match.teamBId === playerId);
  }
  isPlayerTeam(teamId: string): boolean { return !!this.data?.teamId && teamId === this.data.teamId; }
  getMatchStatus(match: KnockoutStageMatch): string { return match.winnerTeamId ? 'COMPLETADO' : 'PENDIENTE'; }
  resolutionLabel(code: string | null | undefined): string { return code?.replace(/_/g, ' ') || 'PENDIENTE'; }
  getDamage(match: KnockoutStageMatch, teamId: string): number | null {
    const value = match.damageByTeam?.find(item => item.teamId === teamId)?.damageDealt;
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }
  getDamagePercent(match: KnockoutStageMatch, teamId: string): number {
    const max = Math.max(1, ...(match.damageByTeam ?? []).map(item => item.damageDealt));
    return Math.min(100, Math.max(0, ((this.getDamage(match, teamId) ?? 0) / max) * 100));
  }

  connectionPaths: string[] = [];
  connectionWidth = 1;
  connectionHeight = 1;

  private frameId: number | null = null;
  private lastGeometry = '';

  constructor(
    private readonly knockoutStageService: KnockoutStageService
  ) {}

  ngOnInit(): void {
    this.knockoutStageService.initialize();
  }

  get data(): KnockoutStageApi | null {
    return this.knockoutStageService.getKnockoutStage();
  }

  get loadError(): boolean {
    return this.knockoutStageService.hasLoadError();
  }
  getTeamName(teamId: string | null | undefined): string {
    if (!teamId) {
      return 'Por definir';
    }

    const journey = this.knockoutStageService.getTeamJourney();

    const team = journey?.teams?.find(
      (item) => item.teamId === teamId
    );

    return team?.name || teamId;
  }


  ngAfterViewChecked(): void {
    this.scheduleConnections();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.scheduleConnections();
  }

  ngOnDestroy(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private scheduleConnections(): void {
    if (this.frameId !== null) {
      return;
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.updateConnections();
    });
  }

  private updateConnections(): void {
    const bracket = document.querySelector<HTMLElement>('app-knockout-stage .knockout-bracket');
    if (!bracket || this.selectedStage !== -1 || bracket.clientWidth === 0) return;

    const width = bracket.clientWidth;
    const height = bracket.clientHeight;
    const bracketRect = bracket.getBoundingClientRect();
    const geometry: number[] = [width, height];
    const paths: string[] = [];
    const positions = new Map<string, { left: number; right: number; centerY: number }>();

    // La correspondencia entre cruces se obtiene de los códigos y slots de la API,
    // nunca del índice visual de la tarjeta.
    bracket.querySelectorAll<HTMLElement>('.knockout-match[data-stage-code][data-slot]').forEach(element => {
      const rect = element.getBoundingClientRect();
      const stage = element.dataset['stageCode'];
      const slot = element.dataset['slot'];
      if (!stage || !slot) return;
      const position = {
        left: rect.left - bracketRect.left + bracket.scrollLeft,
        right: rect.right - bracketRect.left + bracket.scrollLeft,
        centerY: rect.top - bracketRect.top + bracket.scrollTop + rect.height / 2,
      };
      positions.set(`${stage}:${slot}`, position);
      geometry.push(position.left, position.right, position.centerY);
    });

    if (width > 700) {
      for (const round of this.data?.rounds ?? []) {
        for (const match of round.matches) {
          if (!match.nextStageCode || match.nextSlot == null) continue;
          const source = positions.get(`${round.stageCode}:${match.slot}`);
          const target = positions.get(`${match.nextStageCode}:${match.nextSlot}`);
          if (!source || !target || target.left <= source.right) continue;
          const middleX = (source.right + target.left) / 2;
          paths.push(`M ${source.right} ${source.centerY} H ${middleX} V ${target.centerY} H ${target.left}`);
        }
      }
    }

    const signature = JSON.stringify([geometry, paths]);
    if (signature === this.lastGeometry) return;
    this.lastGeometry = signature;
    this.connectionWidth = width;
    this.connectionHeight = height;
    this.connectionPaths = paths;
  }
}
