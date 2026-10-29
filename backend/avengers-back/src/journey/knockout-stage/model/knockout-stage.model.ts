import type {
  DanoDeEquipoApi,
  ResultadoDeEncuentroApi,
} from '../../../basic/model/game-api/encuentros-del-journey-api.model';

export interface KnockoutStageMatch {
  slot: number;
  encounterId: string;
  teamAId: string;
  teamBId: string;
  winnerTeamId: string | null;
  nextStageCode: string | null;
  nextSlot: number | null;

  // Detalles oficiales del encuentro, si están publicados por Game API.
  resolutionCode?: string | null;
  results?: ResultadoDeEncuentroApi[];
  damageByTeam?: DanoDeEquipoApi[];
}

export interface KnockoutStageRound {
  stageCode: string;
  matches: KnockoutStageMatch[];
}

export interface KnockoutStageFinalists {
  playerTeamId: string;
  opponentTeamId: string;
}

export interface KnockoutStageModel {
  teamId: string;
  journeyAvailable: boolean;
  stageCount: number;
  encounterCount: number;
  rounds: KnockoutStageRound[];
  finalists: KnockoutStageFinalists | null;
}
