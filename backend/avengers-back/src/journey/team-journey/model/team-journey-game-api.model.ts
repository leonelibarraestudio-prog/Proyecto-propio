// R7 Game API model - Data received from the Game API by the backend.

// Event from an encounter round.
export interface JourneyEventApi {
  sequence: number;
  eventCode: string;
  stageCode: string | null;
  encounterId: string | null;
  round: number | null;
  teamId: string | null;
  actorHeroId: string | null;
  targetHeroIds: string[];
  messageCode: string;

  values: {
    actorHeroId?: string;
    targetTeamId?: string;
    amount?: number;
    actionCode?: string;
    statCode?: string;
    reasonCode?: string;
    itemId?: string;
    energy?: number;
    abilityPoints?: number;
  };

  narrative: {
    lines: Array<{
      lineSequence: number;
      type: 'NARRATION' | 'DIALOGUE';
      speakerId: string | null;
      text: string;
    }>;
  } | null;
}

// Round from an encounter.
export interface JourneyRoundApi {
  number: number;
  roundType: string;
  initiativeTeamId: string;
  winnerTeamId: string | null;
  damageByTeam: Array<{ teamId: string; damageDealt: number }>;
  activeHeroIdsByTeam: Array<{ teamId: string; heroIds: string[] }>;
  events: JourneyEventApi[];
}

// Encounter summary received from the Game API.
export interface JourneyEncounterApi {
  encounterId: string;
  stageId: string;
  stageCode: string;
  groupId: string | null;
  teamAId: string;
  teamBId: string;
  winnerTeamId: string | null;
  resolutionCode: string;
  rivalEncounter: boolean;
  results: Array<{ teamId: string; resultCode: string }>;
  damageByTeam: Array<{ teamId: string; damageDealt: number }>;
}

// Detail of an encounter received from the Game API.
export interface JourneyEncounterDetailApi extends JourneyEncounterApi {
  rounds: JourneyRoundApi[];
  extraRound: JourneyRoundApi | null;
}

// Encounters from the current attempt.
export interface JourneyEncountersApi {
  attemptId: string;
  encounters: JourneyEncounterApi[];
}
