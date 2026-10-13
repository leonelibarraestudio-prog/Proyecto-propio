import { LiveEventsApi } from './live-events-api.interface';

export type LiveEventsStatus = 'loading' | 'error' | 'empty' | 'data';

export interface LiveEventsViewModel {
  status: LiveEventsStatus;
  error: string | null;
  data: LiveEventsApi | null;
}