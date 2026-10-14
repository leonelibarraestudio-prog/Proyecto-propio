import { JourneyRoundApi } from './team-journey-game-api.model';

// Team, leader, and list of heroes.
export interface JourneyRoster {
  teamId: string;
  name: string;
  leaderId: string;
  heroes: Array<{ id: string; name: string }>;
}

// Player-team encounter displayed in the timeline.
export interface JourneyEncounterItem {
  encounterId: string;
  stageCode: string;
  opponentTeamId: string;
  status: 'COMPLETED';
  resultCode: string | null;
  damageDealt: number | null;
  damageReceived: number | null;
}

// Current Journey and information shared by its encounters.
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

// Published rounds of the selected encounter.
export interface TeamJourneyDetailModel {
  encounterId: string;
  rounds: JourneyRoundApi[];
  extraRound: JourneyRoundApi | null;
}
