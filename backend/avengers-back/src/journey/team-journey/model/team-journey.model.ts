// R7 response model - Data sent from backend to frontend.
export interface TeamJourneyModel {
  teamId: string;
  attemptId: string | null;
  status: string | null;
  stageCount: number | null;
  encounterCount: number | null;
}
