
import { Injectable } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ResponseObject } from '../../../../core/models/response-object.interface';

interface SimulationApi {
  teamId: string;
  currentAttempt: { id: string; status?: string } | null;
}

export interface AwardWinner {
  teamId: string;
  heroId: string;
}

export interface AwardWinningFacts {
  metricCode?: string;
  value?: number;
  [key: string]: unknown;
}

export interface Award {
  code: string;
  label: string;
  explanation: string;
  winner: AwardWinner | null;
  winningFacts: AwardWinningFacts | null;
  reason: string;
}

export interface TeamStatistics {
  teamId: string;
  encounters?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  damageDealt?: number;
  damageReceived?: number;
  healing?: number;
  kosCaused?: number;
  kosSuffered?: number;
  rewardPointsEarned?: number;
  rewardPointsSpent?: number;
  [key: string]: unknown;
}

export interface HeroStatistics {
  teamId: string;
  heroId: string;
  eligible?: boolean;
  totals?: Record<string, unknown>;
  journey?: Record<string, unknown>;
  finalStage?: Record<string, unknown>;
}

export interface AwardsResponse {
  attemptId: string;
  playerTeamId?: string;
  language?: string;
  status: string;
  completionOutcome: string;
  endingCode?: string;
  terminalReasonCode?: string | null;
  completedAt?: string;
  competition?: {
    journeyEncounters?: number;
    finalStagePlayed?: boolean;
    finalStageNormalTurnsPlayed?: number;
  };
  teamStatistics?: TeamStatistics[];
  heroStatistics?: HeroStatistics[];
  awards?: Award[];
}

export interface HeroRosterItem {
  id: string;
  displayName: string;
}

export interface HeroRosterResponse {
  heroes: HeroRosterItem[];
}

@Injectable({ providedIn: 'root' })
export class AwardsService {
  constructor(private readonly api: ApiService) {}

  getAwards(): Observable<ResponseObject<AwardsResponse>> {
    return this.api.get<SimulationApi>('/journey/simulation').pipe(
      switchMap((response) => {
        const simulation = response?.data;
        const teamId = simulation?.teamId;
        const attemptId = simulation?.currentAttempt?.id;

        if (!teamId || !attemptId) {
          return throwError(
            () => new Error('No se encontró una Journey actual para consultar.'),
          );
        }

        return this.api.get<AwardsResponse>(
          `/results/awards/${encodeURIComponent(teamId)}/${encodeURIComponent(attemptId)}`,
          { lang: 'es' },
        );
      }),
    );
  }

  getHeroes(): Observable<ResponseObject<HeroRosterResponse>> {
    return this.api.get<HeroRosterResponse>('/my-team/heroes');
  }
}
