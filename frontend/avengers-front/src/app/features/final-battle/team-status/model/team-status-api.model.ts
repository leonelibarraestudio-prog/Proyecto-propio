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

export interface TeamStatusHeroModel {
  heroId: string;
  displayName: string;
  status: string;
  condition: string;
  maximumEnergy: number;
  currentEnergy: number;
  maximumAbilityPoints: number;
  currentAbilityPoints: number;
  returnAtTurn: number;
}

export interface TeamStatusTeamModel {
  teamId: string;
  leaderId: string;
  strategyCode: string;
  heroes: TeamStatusHeroModel[];
  vacantActiveHeroIds: string[];
  synergyCode: string;
  teamActionsRemaining: number;
  leaderAbilityUsesRemaining: number;
  strategyChangesRemaining: number;
}

export interface TeamStatusTeamsModel {
  variant: string;
  attemptId: string;
  player: TeamStatusTeamModel;
  opponent: TeamStatusTeamModel;
}

export interface TeamStatusModel {
  finalStage: FinalStageStateApi;
  teams: TeamStatusTeamsModel | null;
}
