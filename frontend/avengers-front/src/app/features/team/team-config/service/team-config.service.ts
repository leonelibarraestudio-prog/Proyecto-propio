import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamConfigData } from '../model/team-config-api.interface';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TeamConfigService {
  private readonly apiUrl = 'http://localhost:4102/gameCore/my-team/configuration';

  constructor(private readonly http: HttpClient) {}

  getTeamConfig(): Observable<TeamConfigData> {
    return this.http.get<TeamConfigData>(this.apiUrl);
  }

updateTeamConfig(payload: any): Observable<any> {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return this.http.put<any>(this.apiUrl, payload, { headers });
}
}