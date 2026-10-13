
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ResponseObject } from '../../../../core/models/response-object.interface';

export interface Award {
  code: string;
  label: string;
  explanation: string;
  winner: {
    name?: string;
    displayName?: string;
  } | null;
  winningFacts: object | null;
  reason: string;
}

export interface AwardsResponse {
  attemptId: string;
  status: string;
  completionOutcome: string;
  awards: Award[];
}

@Injectable({ providedIn: 'root' })
export class AwardsService {
  constructor(private readonly api: ApiService) {}

  getAwards(): Observable<ResponseObject<AwardsResponse>> {
    return this.api.get<AwardsResponse>('/results/awards');
  }

  initialize(): void {
    // La carga de premios se realiza desde el componente.
  }
}

