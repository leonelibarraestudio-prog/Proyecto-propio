// R7 API model - Data expected from the backend.

// Event from an encounter round.
export interface JourneyEvent {
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
export interface JourneyRound {
  number: number;
  roundType: string;
  initiativeTeamId: string;
  winnerTeamId: string | null;
  damageByTeam: Array<{ teamId: string; damageDealt: number }>;
  activeHeroIdsByTeam: Array<{ teamId: string; heroIds: string[] }>;
  events: JourneyEvent[];
}

// Team with its leader and heroes.
export interface JourneyRoster {
  teamId: string;
  name: string;
  leaderId: string;
  heroes: Array<{ id: string; name: string }>;
}

// Encounter summary for the Journey timeline.
export interface JourneyEncounterItem {
  encounterId: string;
  stageCode: string;
  opponentTeamId: string;
  status: 'COMPLETED';
  resultCode: string | null;
  damageDealt: number | null;
  damageReceived: number | null;
}

// Summary of the team's current Journey.
export interface TeamJourneyModel {
  teamId: string;
  attemptId: string | null;
  status: string | null;
  stageCount: number | null;
  encounterCount: number | null;
  language: 'es' | 'en';
  teams: JourneyRoster[];
  encounters: JourneyEncounterItem[];
  final: {
    opponentTeamId: string;
    status: string;
    outcome: string | null;
  } | null;
}

// Detail of the selected encounter.
export interface TeamJourneyDetailModel {
  encounterId: string;
  rounds: JourneyRound[];
  extraRound: JourneyRound | null;
}
