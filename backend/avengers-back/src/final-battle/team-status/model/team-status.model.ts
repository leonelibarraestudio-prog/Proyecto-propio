import {
  FinalStageStateApi,
  FinalStageTeamsApi,
  FinalStageHeroApi,
  FinalStageTeamApi,
} from './team-status-api.model';

export interface TeamStatusModel {
  finalStage: FinalStageStateApi;
  teams: TeamStatusTeamsModel | null;
}

export interface TeamStatusHeroModel extends FinalStageHeroApi {
  displayName: string;
}

export interface TeamStatusTeamModel extends Omit<FinalStageTeamApi, 'heroes'> {
  displayName: string;
  heroes: TeamStatusHeroModel[];
}

export interface TeamStatusTeamsModel extends Omit<FinalStageTeamsApi, 'player' | 'opponent'> {
  player: TeamStatusTeamModel;
  opponent: TeamStatusTeamModel;
}
