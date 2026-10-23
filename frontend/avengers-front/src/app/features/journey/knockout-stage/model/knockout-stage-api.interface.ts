
export interface KnockoutStageMatch {
  slot: number;
  encounterId: string;
  teamAId: string;
  teamBId: string;
  winnerTeamId: string | null;
  nextStageCode: string | null;
  nextSlot: number | null;
}

export interface KnockoutStageRound {
  stageCode: string;
  matches: KnockoutStageMatch[];
}

export interface KnockoutStageFinalists {
  playerTeamId: string;
  opponentTeamId: string;
}

export interface KnockoutStageApi {
  teamId: string;
  journeyAvailable: boolean;
  stageCount: number;
  encounterCount: number;
  rounds: KnockoutStageRound[];
  finalists: KnockoutStageFinalists | null;
}
