export interface FinalStageStateApi {
  variant: string;
  status: string;
  phase: string;
  phaseLabel: string;
  normalTurn: number;
  turnState: string;
  attemptId: string;
  participants: {
    playerTeamId: string;
    opponentTeamId: string;
  };
  completion: {
    outcomeCode: string;
    terminalReasonCode: string;
    endingEventSequences: number[];
  } | null;
}

export interface FinalStageHeroApi {
  heroId: string;
  status: string;
  condition: string;
  maximumEnergy: number;
  currentEnergy: number;
  maximumAbilityPoints: number;
  currentAbilityPoints: number;
  returnAtTurn: number;
}

export interface FinalStageTeamApi {
  teamId: string;
  leaderId: string;
  strategyCode: string;
  heroes: FinalStageHeroApi[];
  vacantActiveHeroIds: string[];
  synergyCode: string;
  teamActionsRemaining: number;
  leaderAbilityUsesRemaining: number;
  strategyChangesRemaining: number;
}

export interface FinalStageTeamsApi {
  variant: string;
  attemptId: string;
  player: FinalStageTeamApi;
  opponent: FinalStageTeamApi;
}
