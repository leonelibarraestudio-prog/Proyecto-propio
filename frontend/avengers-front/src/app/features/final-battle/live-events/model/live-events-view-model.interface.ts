import { AppLanguage } from '../../../../core/services/i18n.service';
import { LiveEventsApi } from './live-events-api.interface';

export type LiveEventsPageStatus = 'loading' | 'error' | 'empty' | 'unavailable' | 'data';

export interface LiveEventsViewModel {
  status: LiveEventsPageStatus;
  error: string | null;
  errorCode: string | null;
  data: LiveEventsApi | null;
  lang: AppLanguage;
  refreshing: boolean;
}
