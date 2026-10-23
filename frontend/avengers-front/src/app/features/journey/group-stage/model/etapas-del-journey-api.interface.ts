export interface FaseDeGruposApi {
  attemptId: string;
  teamId: string;
  groupStage: {
    groups: GrupoDeLaFaseApi[];
  };
}

export interface GrupoDeLaFaseApi {
  groupId: string;
  encounterIds: string[];
  standings: PosicionDeLaFaseApi[];
  encounters: EncuentroDeLaFaseApi[];
}

export interface PosicionDeLaFaseApi {
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
  nombreEquipo: string;
  esMiEquipo: boolean;
}

export interface EncuentroDeLaFaseApi {
  encounterId: string;
  stageId: string;
  stageCode: string;
  groupId: string | null;
  teamAId: string;
  teamBId: string;
  winnerTeamId: string | null;
  resolutionCode: string;
  rivalEncounter: boolean;
  results: ResultadoDeEncuentroApi[];
  damageByTeam: DanoDeEquipoApi[];
  nombreEquipoA: string;
  nombreEquipoB: string;
  seJugo: boolean;
}

export interface ResultadoDeEncuentroApi {
  teamId: string;
  resultCode?: string;
}

export interface DanoDeEquipoApi {
  teamId: string;
  damageDealt?: number;
}

export type EtapasDelJourneyApi = FaseDeGruposApi;
export type GrupoDeLaFase = GrupoDeLaFaseApi;
export type PosicionDeLaFase = PosicionDeLaFaseApi;
