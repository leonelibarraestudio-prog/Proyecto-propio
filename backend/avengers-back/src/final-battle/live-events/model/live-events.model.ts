import {
  FinalStageApi,
  FinalStageEventApi,
} from '../../../basic/model/game-api/final-contract.model';

export interface LiveEventsModel {
  finalStage: FinalStageApi;
  events: FinalStageEventApi[];
}