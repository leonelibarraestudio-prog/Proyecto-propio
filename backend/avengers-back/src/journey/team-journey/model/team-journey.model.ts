//Team,leader,list of heroes
export interface JourneyRoster {
  teamId: string;
  name: string;
  leaderId: string;
  heroes: Array<{ id: string; name: string }>;
}

// Encounter summary for the journey timeline
export interface JourneyEncounterItem {
  encounterId: string;
  stageCode: string;
  opponentTeamId: string;
  opponentName: string;
  opponentLeaderId: string | null;
  status: 'COMPLETED';
  resultCode: string | null;
  damageDealt: number | null;
  damageReceived: number | null;
}

// Summary of the team's entire journey.
export interface TeamJourneyModel {
  teamId: string;
  attemptId: string | null;
  status: string | null;
  stageCount: number | null;
  encounterCount: number | null;
  language: 'es' | 'en';
  teamNames: Record<string, string>;
  heroNames: Record<string, string>;
  teams: JourneyRoster[];
  encounters: JourneyEncounterItem[];
  final: { //Final data
    opponentName: string; 
    status: string; 
    outcome: string | null; 
  } | null;
}

// Detailed information about one encounter in the team's journey.
export interface TeamJourneyDetailModel {
  attemptId: string;
  encounterId: string;
  playerTeam: JourneyRoster;
  opponentTeam: JourneyRoster;
  
  rounds: Array<{
    number: number;
    roundType: string;
    initiativeTeamId: string;
    initiativeTeamName: string;
    winnerTeamName: string | null;
    damageByTeam: Array<{ teamName: string; damageDealt: number }>;
    activeHeroIdsByTeam: Array<{ teamId: string; heroIds: string[] }>;

    events: Array<{
      sequence: number;
      eventCode: string;
      actorName: string | null;
      targetNames: string[];
      targetTeamName: string | null;
      amount: number | null;
      lines: Array<{
        type: 'NARRATION' | 'DIALOGUE';
        speakerId: string | null;
        text: string;
      }>;
    }>;
  }>;
}
