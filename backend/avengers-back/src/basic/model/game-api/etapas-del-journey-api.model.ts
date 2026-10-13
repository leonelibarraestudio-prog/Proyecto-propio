export interface EtapasDelJourneyApi {
  attemptId: string;
  groupStage: {
    groups: GrupoDeLaFase[];
  };
}

export interface GrupoDeLaFase {
  groupId: string;
  encounterIds: string[];
  standings: PosicionDeLaFase[];
}

export interface PosicionDeLaFase {
  position: number;
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  damageDealt: number;
  damageReceived: number;
  damageDifference: number;
  tieBreakRank: number;
  qualified: boolean;
}
