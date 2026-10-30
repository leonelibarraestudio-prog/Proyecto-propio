import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import {
  FinalHistoryItemApi,
  FinalJourneyAwardApi,
  FinalJourneyCompetitionApi,
  FinalJourneyEventApi,
  FinalJourneySummaryApi,
  FinalJourneyTeamApi,
  FinalJourneyTeamStatisticsApi,
} from '../../basic/model/game-api/final-contract.model';

export interface HistorySummary {
  total: number;
  victories: number;
  defeats: number;
  abandoned: number;
}

export interface HistoryModel {
  teamId: string;
  language: string;
  summary: HistorySummary;
  items: FinalHistoryItemApi[];
}

export interface HistoryStatisticsModel {
  competition: FinalJourneyCompetitionApi;
  teamStatistics: FinalJourneyTeamStatisticsApi[];
  awards: FinalJourneyAwardApi[];
}

export interface HistoryDetailModel {
  summary: FinalJourneySummaryApi;
  teams: FinalJourneyTeamApi[];
  teamNames: Record<string, string>;
  events: FinalJourneyEventApi[];
  statistics: HistoryStatisticsModel | null;
}

@Injectable()
export class HistoryService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getHistory(): Promise<HistoryModel> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;
    const history = await this.game.history(teamId, language);

    const items = [...history.items].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );

    return {
      teamId: history.teamId,
      language: history.language,
      summary: {
        total: items.length,
        victories: items.filter((item) => item.outcomeCode === 'VICTORY').length,
        defeats: items.filter((item) => item.outcomeCode === 'DEFEAT').length,
        abandoned: items.filter((item) => item.outcomeCode === 'ABANDON').length,
      },
      items,
    };
  }

  async getHistoryDetail(attemptId: string): Promise<HistoryDetailModel> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;

    const [summary, journeyTeams, journeyEvents, statistics] = await Promise.all([
      this.game.journeySummary(teamId, attemptId, language),
      this.game.journeyTeams(teamId, attemptId),
      this.game.journeyEvents(teamId, attemptId, language),
      this.game.journeyStatistics(teamId, attemptId, language).catch(() => null),
    ]);

    const finalistIds = [summary.finalists.playerTeamId, summary.finalists.opponentTeamId];

    return {
      summary,
      teamNames: Object.fromEntries(journeyTeams.teams.map((team) => [team.teamId, team.name])),
      teams: journeyTeams.teams.filter((team) => finalistIds.includes(team.teamId)),
      events: journeyEvents.events,
      statistics: statistics
        ? {
            competition: statistics.competition,
            teamStatistics: statistics.teamStatistics.filter((stats) =>
              finalistIds.includes(stats.teamId),
            ),
            awards: statistics.awards,
          }
        : null,
    };
  }
}