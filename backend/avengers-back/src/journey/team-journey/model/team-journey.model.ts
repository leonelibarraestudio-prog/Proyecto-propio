import { JourneyRoundApi } from './team-journey-game-api.model';

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
  rounds: JourneyRoundApi[];
  extraRound: JourneyRoundApi | null;
}
