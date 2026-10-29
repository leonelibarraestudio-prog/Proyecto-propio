
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameFeatureApiService } from '../../basic/game-feature-api.service';

@Injectable()
export class HistoryRivalsService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly game: GameFeatureApiService,
  ) {}

  async getHistory(attemptId?: string) {
    const teamId = this.context.getCurrentTeamId();
    const language = this.context.language;

    const [
      history,
      configuration,
      heroCatalog,
      relationshipCatalog,
      journey,
    ] = await Promise.all([
      this.game.history(teamId, language),
      this.game.configuration(teamId),
      this.game.heroes(language),
      this.game.relationships([]),
      this.game.currentJourney(teamId, language),
    ]);

    const configuredHeroIds = configuration.configuration
      ? [
          configuration.configuration.leaderId,
          ...configuration.configuration.companionIds,
        ]
      : [];

    const relationships = relationshipCatalog.relationships.filter(
      (relationship) =>
        configuredHeroIds.includes(relationship.heroAId) ||
        configuredHeroIds.includes(relationship.heroBId),
    );

    // Catálogo de nombres legibles usando los identificadores canónicos.
    const heroNames = new Map<string, string>(
      heroCatalog.heroes.map((hero) => [
        hero.id,
        hero.displayName ?? hero.id,
      ]),
    );

    const heroes = configuredHeroIds.map((heroId) => {
      const hero = heroCatalog.heroes.find(
        (item) => item.id === heroId,
      );

      const heroRelationships = relationships.filter(
        (relationship) =>
          relationship.heroAId === heroId ||
          relationship.heroBId === heroId,
      );

      const rivals = [
        ...new Set(
          heroRelationships
            .filter(
              (relationship) => relationship.relationship === 'RIVAL',
            )
            .map((relationship) =>
              relationship.heroAId === heroId
                ? relationship.heroBId
                : relationship.heroAId,
            ),
        ),
      ];

      const rivalNames: Record<string, string> = {};

      for (const rivalId of rivals) {
        rivalNames[rivalId] = heroNames.get(rivalId) ?? rivalId;
      }

      return {
        id: heroId,
        name: hero?.displayName ?? heroId,
        rivals,
        rivalNames,
      };
    });

    let encounters: Awaited<
      ReturnType<GameFeatureApiService['currentEncounters']>
    >['encounters'] = [];

    let teams: Awaited<
      ReturnType<GameFeatureApiService['currentTeams']>
    >['teams'] = [];

    if (attemptId) {
      const selectedJourney = history.items.find(
        (item) => item.attemptId === attemptId,
      );

      if (!selectedJourney) {
        throw new NotFoundException(
          'La partida indicada no existe en el historial del equipo.',
        );
      }

      const [encounterData, teamData] = await Promise.all([
        this.game.journeyEncounters(teamId, attemptId),
        this.game.journeyTeams(teamId, attemptId),
      ]);

      encounters = encounterData.encounters;
      teams = teamData.teams;
    } else if (journey.attempt) {
      const [encounterData, teamData] = await Promise.all([
        this.game.currentEncounters(teamId),
        this.game.currentTeams(teamId),
      ]);

      encounters = encounterData.encounters;
      teams = teamData.teams;
    }

    return {
      ...history,
      heroes,
      relationships,
      teams,
      encounters,
    };
  }
}
