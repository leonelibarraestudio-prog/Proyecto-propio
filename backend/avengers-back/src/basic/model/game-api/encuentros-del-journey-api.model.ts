export interface EncuentrosDelJourneyApi {
  attemptId: string;
  encounters: EncuentroDelJourneyApi[];
}

export interface EncuentroDelJourneyApi {
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
}

export interface ResultadoDeEncuentroApi {
  teamId: string;
  resultCode?: string;
}

export interface DanoDeEquipoApi {
  teamId: string;
  damageDealt?: number;
}
