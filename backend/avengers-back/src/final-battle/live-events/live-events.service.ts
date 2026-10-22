import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import { ErrorCode } from '../../basic/error/error-code.enum';
import { FinalStageApi, FinalStageEventApi } from '../../basic/model/game-api/final-contract.model';
import {
  LiveEventItem,
  LiveEventsHeroRef,
  LiveEventsModel,
  LiveEventsStatus,
} from './model/live-events.model';

const LIVE_EVENTS_API_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: ErrorCode.FINAL_STAGE_UNAVAILABLE,
    message: 'The Final is not available right now.',
  },
  [HttpStatus.CONFLICT]: {
    messageCode: ErrorCode.FINAL_STAGE_UNAVAILABLE,
    message: 'The Final is not available right now.',
  },
};

const LIVE_EVENTS_API_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: ErrorCode.FINAL_STAGE_UNAVAILABLE,
  message: 'Unable to load the Final events right now.',
};

@Injectable()
export class LiveEventsService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getEvents(): Promise<LiveEventsModel> {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;

    try {
      const [finalStage, eventCatalog, heroCatalog, teamCatalog] = await Promise.all([
        this.game.finalStage(teamId, language),
        this.game.finalStageEvents(teamId, language),
        this.game.heroes(language),
        this.game.currentTeams(teamId),
      ]);
      const heroNames = new Map<string, string>(
        heroCatalog.heroes.map((hero): [string, string] => [hero.id, hero.displayName]),
      );
      const teamNames = new Map<string, string>(
        teamCatalog.teams.map((team): [string, string] => [team.teamId, team.name]),
      );
      const events = [...eventCatalog.events]
        .sort((first, second) => first.sequence - second.sequence)
        .map((event) => this.toEventItem(event, heroNames));

      return {
        finalStage: this.toStatus(finalStage, teamNames),
        totalEvents: events.length,
        events,
      };
    } catch (error) {
      ErrorUtils.mapGameApiError(
        error,
        LIVE_EVENTS_API_ERROR_STATUS_MAP,
        LIVE_EVENTS_API_ERROR_FALLBACK,
      );
    }
  }

  private toStatus(finalStage: FinalStageApi, teamNames: Map<string, string>): LiveEventsStatus {
    return {
      status: finalStage.status,
      phase: finalStage.phase,
      phaseLabel: finalStage.phaseLabel,
      normalTurn: finalStage.normalTurn,
      turnState: finalStage.turnState,
      completed: finalStage.completion !== null,
      outcomeCode: finalStage.completion?.outcomeCode ?? null,
      playerTeamId: finalStage.participants.playerTeamId,
      opponentTeamId: finalStage.participants.opponentTeamId,
      playerTeamName: teamNames.get(finalStage.participants.playerTeamId) ?? null,
      opponentTeamName: teamNames.get(finalStage.participants.opponentTeamId) ?? null,
    };
  }

  private toEventItem(event: FinalStageEventApi, heroNames: Map<string, string>): LiveEventItem {
    const values = event.values;
    const actorId = values.actorHeroId ?? values.actorIdentityId;
    const targetIds = values.targetHeroIds ?? [];
    const targetTeamSide =
      values.targetId === 'PLAYER' || values.targetId === 'OPPONENT' ? values.targetId : null;

    return {
      sequence: event.sequence,
      turn: event.turn,
      phase: event.phase,
      eventCode: event.eventCode,
      actor: actorId ? this.heroRef(actorId, heroNames) : null,
      targets: targetIds.map((id) => this.heroRef(id, heroNames)),
      targetSideCode: values.targetSideCode ?? null,
      actionName: values.actionName ?? null,
      actionCode: values.actionCode ?? null,
      damage: values.damage ?? null,
      amount: values.amount ?? null,
      apChange: values.apChange ?? null,
      abilityPoints: values.abilityPoints ?? null,
      energy: values.energy ?? null,
      strategyCode: values.strategyCode ?? null,
      targetTeamSide,
      statCode: values.statCode ?? null,
      percent: values.percent ?? null,
      duration: values.duration ?? null,
      lines: event.narrative.lines.map((line) => ({
        lineSequence: line.lineSequence,
        type: line.type,
        speaker: line.speakerId ? this.heroRef(line.speakerId, heroNames) : null,
        text: line.text,
      })),
    };
  }

  private heroRef(id: string, heroNames: Map<string, string>): LiveEventsHeroRef {
    return { id, name: heroNames.get(id) ?? null };
  }
}
