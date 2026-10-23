
import {
  AfterViewChecked,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { KnockoutStageApi } from './model/knockout-stage-api.interface';
import { KnockoutStageService } from './service/knockout-stage.service';

@Component({
  selector: 'app-knockout-stage',
  templateUrl: './knockout-stage.component.html',
  styleUrls: ['./knockout-stage.component.css'],
  standalone: false,
})
export class KnockoutStageComponent
  implements OnInit, AfterViewChecked, OnDestroy {

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
    const bracket = document.querySelector<HTMLElement>(
      'app-knockout-stage .knockout-bracket'
    );

    if (!bracket) {
      return;
    }

    const rounds = Array.from(
      bracket.querySelectorAll<HTMLElement>('.knockout-round')
    );

    const width = bracket.clientWidth;
    const height = bracket.clientHeight;

    const paths: string[] = [];
    const geometry: number[] = [width, height];

    const bracketRect = bracket.getBoundingClientRect();

    const getPosition = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();

      const position = {
        left: rect.left - bracketRect.left + bracket.scrollLeft,
        right: rect.right - bracketRect.left + bracket.scrollLeft,
        centerY: rect.top - bracketRect.top +
          bracket.scrollTop + rect.height / 2,
      };

      geometry.push(
        position.left,
        position.right,
        position.centerY
      );

      return position;
    };

    const positions = rounds.map(round =>
      Array.from(
        round.querySelectorAll<HTMLElement>('.knockout-match')
      ).map(getPosition)
    );

    if (rounds.length >= 2 && width > 700) {
      for (let roundIndex = 0; roundIndex < positions.length - 1; roundIndex++) {
        const current = positions[roundIndex];
        const next = positions[roundIndex + 1];

        for (let index = 0; index < next.length; index++) {
          const first = current[index * 2];
          const second = current[index * 2 + 1];
          const target = next[index];

          if (!first || !second || !target) {
            continue;
          }

          const startX = Math.max(first.right, second.right);
          const endX = target.left;

          if (endX <= startX) {
            continue;
          }

          const middleX = (startX + endX) / 2;

          paths.push(
            `M ${first.right} ${first.centerY}
             H ${middleX}
             V ${second.centerY}
             H ${second.right}
             M ${middleX} ${(first.centerY + second.centerY) / 2}
             V ${target.centerY}
             H ${endX}`
          );
        }
      }
    }

    const signature = JSON.stringify([
      geometry,
      paths,
    ]);

    if (signature === this.lastGeometry) {
      return;
    }

    this.lastGeometry = signature;
    this.connectionWidth = width;
    this.connectionHeight = height;
    this.connectionPaths = paths;
  }
}
