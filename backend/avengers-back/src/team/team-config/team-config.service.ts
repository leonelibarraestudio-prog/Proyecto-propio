import { Injectable } from '@nestjs/common';
import { ApplicationContextService } from '../../basic/services/application-context.service';
import { GameApiService } from '../../basic/game-api.service';
import { TeamConfigResponse, UpdateTeamConfigDto } from './model/team-config.model';

@Injectable()
export class TeamConfigService {
  constructor(
    private readonly context: ApplicationContextService,
    private readonly gameApi: GameApiService,
  ) {}

  async getConfiguration(): Promise<TeamConfigResponse> {
    const teamId = this.context.getCurrentTeamId() || 'falcon';

    
    const [rawConfig, catalogData, strategiesData]: [any, any, any] = await Promise.all([
      this.gameApi.get(`/teams/${teamId}/configuration`).catch(() => null),
      this.gameApi.get(`/heroes`).catch(() => null),
      this.gameApi.get(`/reference/strategies`).catch(() => null),
    ]);

    const config = rawConfig?.configuration || rawConfig || {};
    const rawHeroes = catalogData?.heroes || catalogData || [];
    const rawStrategies = strategiesData?.strategies || strategiesData || [];

    const leaderId = config.leaderId || 'falcon';
    const companionIds: string[] = config.companionIds || [];
    const activeIds: string[] = config.activeHerolds || [leaderId];

    
    const catalog = Array.isArray(rawHeroes)
      ? rawHeroes.map((h: any) => ({
          id: h.id || h.code,
          name: h.displayName || h.name || h.id,
          role: h.roles?.primary?.label || h.role || 'Héroe',
        }))
      : [];

    
    const strategies = Array.isArray(rawStrategies)
      ? rawStrategies.map((s: any) => ({
          code: s.code || s.id || s,
          label: s.label || s.name || s.code || s,
          description: s.description || '',
        }))
      : [];

    const leaderHero = catalog.find((h: any) => h.id === leaderId) || {
      id: leaderId,
      name: 'Falcon',
      role: 'Líder / Ataque Aéreo',
    };

    const teamHeroIds = [leaderId, ...companionIds];
    const members = teamHeroIds.map((id) => {
      const found = catalog.find((h: any) => h.id === id);
      return {
        id,
        name: found ? found.name : id,
        role: found ? found.role : 'Acompañante',
        isActive: activeIds.includes(id),
      };
    });

    return {
      teamId,
      strategy: config.strategyCode || config.strategy || 'BALANCED',
      leader: leaderHero,
      members,
      availableCatalog: catalog.filter((h: any) => !teamHeroIds.includes(h.id)),
      strategies,
      editability: config.editability || { members: true, formation: true, strategy: true },
      updatedAt: new Date().toISOString(),
    };
  }

  async updateConfiguration(dto: UpdateTeamConfigDto): Promise<any> {
    const teamId = this.context.getCurrentTeamId() || 'falcon';
    return await this.gameApi.put(`/teams/${teamId}/configuration`, {
      companionIds: dto.companionIds,
      activeHeroIds: dto.activeHeroIds,
      strategy: dto.strategy,
    });
  }
}