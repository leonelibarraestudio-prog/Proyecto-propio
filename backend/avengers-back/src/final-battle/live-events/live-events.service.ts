import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';
import { ErrorCode } from '../../basic/error/error-code.enum';
import {
  FinalJourneyTeamApi,
  FinalStageApi,
  FinalStageEventApi,
} from '../../basic/model/game-api/final-contract.model';
import {
  LiveEventItem,
  LiveEventsHeroRef,
  LiveEventsHeroSide,
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

interface HeroLookup {
  names: Map<string, string>;
  sides: Map<string, LiveEventsHeroSide>;
}

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
      const teamNames = new Map<string, string>(
        teamCatalog.teams.map((team): [string, string] => [team.teamId, team.name]),
      );
      const lookup = this.buildHeroLookup(finalStage, heroCatalog.heroes, teamCatalog.teams);
      const events = [...eventCatalog.events]
        .sort((first, second) => first.sequence - second.sequence)
        .map((event) => this.toEventItem(event, lookup));

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

  private buildHeroLookup(
    finalStage: FinalStageApi,
    heroes: Array<{ id: string; displayName: string }>,
    teams: FinalJourneyTeamApi[],
  ): HeroLookup {
    const names = new Map<string, string>(
      heroes.map((hero): [string, string] => [hero.id, hero.displayName]),
    );
    const sides = new Map<string, LiveEventsHeroSide>();
    const participants: Array<[string, LiveEventsHeroSide]> = [
      [finalStage.participants.playerTeamId, 'PLAYER'],
      [finalStage.participants.opponentTeamId, 'OPPONENT'],
    ];

    for (const [participantId, side] of participants) {
      const team = teams.find((candidate) => candidate.teamId === participantId);
      for (const heroId of team?.heroIds ?? []) {
        sides.set(heroId, side);
      }
    }

    return { names, sides };
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

  private toEventItem(event: FinalStageEventApi, lookup: HeroLookup): LiveEventItem {
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
      actor: actorId ? this.heroRef(actorId, lookup) : null,
      targets: targetIds.map((id) => this.heroRef(id, lookup)),
      targetSideCode: values.targetSideCode ?? null,
      targetTeamSide,
      actionName: values.actionName ?? null,
      actionCode: values.actionCode ?? null,
      damage: values.damage ?? null,
      amount: values.amount ?? null,
      apChange: values.apChange ?? null,
      abilityPoints: values.abilityPoints ?? null,
      energy: values.energy ?? null,
      strategyCode: values.strategyCode ?? null,
      statCode: values.statCode ?? null,
      percent: values.percent ?? null,
      duration: values.duration ?? null,
      lines: event.narrative.lines.map((line) => ({
        lineSequence: line.lineSequence,
        type: line.type,
        speaker: line.speakerId ? this.heroRef(line.speakerId, lookup) : null,
        text: line.text,
      })),
    };
  }

  private heroRef(id: string, lookup: HeroLookup): LiveEventsHeroRef {
    return {
      id,
      name: lookup.names.get(id) ?? null,
      side: lookup.sides.get(id) ?? null,
    };
  }
}