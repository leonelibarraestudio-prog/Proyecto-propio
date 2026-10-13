import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TeamConfigService {
  private readonly apiUrl = 'http://localhost:4102/gameCore/my-team/configuration'; 

  constructor(private readonly http: HttpClient) {}

  getTeamConfig(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}