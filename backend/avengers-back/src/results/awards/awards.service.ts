import { Injectable } from '@nestjs/common';
import { GameApiService } from '../../basic/game-api.service';

export interface AwardWinner {
  teamId: string;
  heroId: string;
}

export interface AwardWinningFacts {
  metricCode?: string;
  value?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface OfficialAward {
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

export interface AwardsStatistics {
  attemptId: string;
  playerTeamId?: string;
  language?: string;
  status: string;
  completionOutcome: string;
  endingCode?: string;
  terminalReasonCode?: string | null;
  completedAt?: string;
  eligibility?: unknown;
  competition?: {
    journeyEncounters?: number;
    finalStagePlayed?: boolean;
    finalStageNormalTurnsPlayed?: number;
  };
  teamStatistics?: TeamStatistics[];
  heroStatistics?: HeroStatistics[];
  awards?: OfficialAward[];
}

@Injectable()
export class AwardsService {
  constructor(private readonly gameApi: GameApiService) {}

  /**
   * The Game API is the source of truth for eligibility, award winners and metrics.
   * This service only forwards its published statistics; it never calculates awards.
   */
  getAwards(teamId: string, attemptId: string, lang = 'es'): Promise<AwardsStatistics> {
    return this.gameApi
      .get<AwardsStatistics>(
        `/teams/${encodeURIComponent(teamId)}/journeys/${encodeURIComponent(attemptId)}/statistics`,
        { lang },
      )
      .then((statistics) => ({ ...statistics, playerTeamId: teamId }));
  }
}
