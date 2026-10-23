import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TeamConfigService } from './service/team-config.service';
import { TeamConfigData, TeamMember } from './model/team-config-api.interface';

@Component({
  selector: 'app-team-config',
  templateUrl: './team-config.component.html',
  styleUrls: ['./team-config.component.css'],
  standalone: false,
})
export class TeamConfigComponent implements OnInit {
  teamConfigData: TeamConfigData | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isSaving: boolean = false;

  searchTerm: string = '';
  selectedRole: string = 'ALL';

  constructor(
    private readonly teamConfigService: TeamConfigService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  setRoleFilter(role: string): void {
    this.selectedRole = role;
  }

  get filteredCatalog() {
    if (!this.teamConfigData?.availableCatalog) return [];
    
    let catalog = this.teamConfigData.availableCatalog;

    if (this.selectedRole !== 'ALL') {
      catalog = catalog.filter(hero => hero.role?.toUpperCase() === this.selectedRole.toUpperCase());
    }

    if (this.searchTerm.trim()) {
      const query = this.searchTerm.toLowerCase().trim();
      catalog = catalog.filter(hero => {
        const nameMatch = hero.name?.toLowerCase().includes(query);
        const roleMatch = hero.role?.toLowerCase().includes(query);
        return nameMatch || roleMatch;
      });
    }

    return catalog;
  }

  loadConfig(): void {
    this.errorMessage = '';
    this.teamConfigService.getTeamConfig().subscribe({
      next: (response: any) => {
        if (response && response.strategies) {
          response.strategies = response.strategies.filter(
            (s: any) => (s.code || s.id) !== 'PRAGMATIC'
          );
        }
        this.teamConfigData = response;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al obtener la configuración:', err);
        this.errorMessage = 'No se pudo conectar con el servidor para traer la configuración.';
        this.cdr.detectChanges();
      },
    });
  }

  toggleActiveStatus(member: TeamMember): void {
    if (!this.teamConfigData?.editability?.formation) return;
    if (member.id === this.teamConfigData?.leader?.id) return;

    const currentActives = this.teamConfigData.members.filter((m) => m.isActive).length;

    if (!member.isActive && currentActives >= 3) {
      this.errorMessage = 'Solo puede haber hasta 3 héroes activos en la formación titular.';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    member.isActive = !member.isActive;
    this.cdr.detectChanges();
  }

  removeMember(memberId: string): void {
    if (!this.teamConfigData) return;
    if (memberId === this.teamConfigData.leader?.id) return;

    const removedMember = this.teamConfigData.members.find((m) => m.id === memberId);
    this.teamConfigData.members = this.teamConfigData.members.filter((m) => m.id !== memberId);

    if (removedMember && this.teamConfigData.availableCatalog) {
      const alreadyInCatalog = this.teamConfigData.availableCatalog.some((h) => h.id === removedMember.id);
      if (!alreadyInCatalog) {
        this.teamConfigData.availableCatalog.push({
          id: removedMember.id,
          name: removedMember.name,
          role: removedMember.role,
        });
        // Reordena alfabeticamente
        this.teamConfigData.availableCatalog.sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  }

  addHeroById(heroId: string): void {
    if (!this.teamConfigData) return;

    if (this.teamConfigData.members.length >= 6) {
      this.errorMessage = 'El equipo ya tiene el máximo de 6 integrantes.';
      return;
    }

    const catalog = this.teamConfigData.availableCatalog || [];
    const hero = catalog.find((h) => h.id === heroId);

    if (hero) {
      const currentActives = this.teamConfigData.members.filter((m) => m.isActive).length;

      this.teamConfigData.members.push({
        id: hero.id,
        name: hero.name,
        role: hero.role,
        isActive: currentActives < 3,
      });

      this.teamConfigData.availableCatalog = catalog.filter((h) => h.id !== heroId);
      this.errorMessage = '';
    }
  }

  getHeroImageUrl(heroId: string): string {
    if (!heroId) return 'assets/portraits/falcon-portrait.webp';
    return `assets/portraits/${heroId.toLowerCase()}-portrait.webp`;
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/portraits/falcon-portrait.webp';
  }

  getStrategyClass(): string {
    const strat = this.teamConfigData?.strategy?.toUpperCase();
    if (strat === 'AGGRESSIVE') return 'strat-red';
    if (strat === 'DEFENSIVE') return 'strat-green';
    if (strat === 'BALANCED') return 'strat-orange';
    return '';
  }

  saveConfiguration(): void {
    if (!this.teamConfigData) return;

    const companionIds = this.teamConfigData.members
      .filter((m) => m.id !== this.teamConfigData?.leader?.id)
      .map((m) => String(m.id))
      .slice(0, 5); 

    let activeHeroIds = this.teamConfigData.members
      .filter((m) => m.isActive)
      .map((m) => String(m.id));

    if (this.teamConfigData.leader && !activeHeroIds.includes(String(this.teamConfigData.leader.id))) {
      activeHeroIds.unshift(String(this.teamConfigData.leader.id));
    }

    for (const id of companionIds) {
      if (activeHeroIds.length >= 3) break;
      if (!activeHeroIds.includes(id)) {
        activeHeroIds.push(id);
      }
    }

    if (activeHeroIds.length > 3) {
      activeHeroIds = activeHeroIds.slice(0, 3);
    }

    while (activeHeroIds.length < 3 && companionIds.length > 0) {
      activeHeroIds.push(companionIds[0]);
    }
    
    const payload = {
      companionIds,
      activeHeroIds, 
      strategy: this.teamConfigData.strategy
    };

    console.log('PAYLOAD', payload);

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.teamConfigService.updateTeamConfig(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = '¡Configuración guardada correctamente!';
        
        if (this.teamConfigData && this.teamConfigData.members) {
          this.teamConfigData.members.forEach(m => {
            m.isActive = activeHeroIds.includes(m.id);
          });
        }

        this.loadConfig();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('ERROR COMPLETO DEL BACKEND', err.error);
        const serverMsg = err?.error?.responseMessage?.message || err?.error?.message || 'Bad Request';
        this.errorMessage = `Error al guardar: ${typeof serverMsg === 'object' ? JSON.stringify(serverMsg) : serverMsg}`;
        this.cdr.detectChanges();
      },
    });
  }
}