
import { Injectable } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ResponseObject } from '../../../../core/models/response-object.interface';

interface SimulationApi {
  teamId: string;
  currentAttempt: {
    id: string;
  } | null;
}

export interface AwardsResponse {
  statistics: unknown;
  rewards: unknown;
}

@Injectable({ providedIn: 'root' })
export class AwardsService {
  constructor(private readonly api: ApiService) {}

  getAwards(): Observable<ResponseObject<AwardsResponse>> {
    return this.api.get<SimulationApi>('/journey/simulation').pipe(
      switchMap((response) => {
        const simulation = response?.data;

        if (!simulation || !simulation.teamId || !simulation.currentAttempt?.id) {
          return throwError(
            () => new Error('No se encontró el equipo o el intento actual de la Journey.'),
          );
        }

        const { teamId, currentAttempt } = simulation;

        return this.api.get<AwardsResponse>(
          `/results/awards/${encodeURIComponent(teamId)}/${encodeURIComponent(currentAttempt.id)}`,
        );
      }),
    );
  }
}
