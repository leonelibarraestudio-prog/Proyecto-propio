import { Component, DoCheck, HostListener, OnDestroy, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { HeroArtworkResolverService } from '../../../core/services/hero-artwork-resolver.service';
import { FinalBattleService, BattleActionGroup } from './service/final-battle.service';
import { BattleAction, BattleEvent, BattleHero, BattleTeam } from './model/final-battle-api.interface';

type CommandCategory = 'attack' | 'support' | 'strategy' | 'inventory';

type LabelMap = Record<string, string>;

@Component({
  selector: 'app-final-battle',
  templateUrl: './final-battle.component.html',
  styleUrls: ['./final-battle.component.css', './scene.css'],
  standalone: false,
})
export class FinalBattleComponent implements OnInit, DoCheck, OnDestroy {
  // Visual state.
  commandCategory: CommandCategory = 'attack';

  strategyMode: 'choose' | 'change' | 'swap' = 'choose';

  confirmingAbandon = false;

  // Audio state.
  private readonly doomRevealAudioUrl = 'assets/audio/doom-show.mp3';

  private readonly doomDefeatedAudioUrl = 'assets/audio/doom-defeated.mp3';

  private readonly doomWinAudioUrl = 'assets/audio/doom-win.mp3';

  private readonly doomByeAudioUrl = 'assets/audio/doom-bye.mp3';

  private readonly executeAudioUrl = 'assets/audio/action-execute.mp3';

  private executeAudio: HTMLAudioElement | null = null;

  private doomVisibilityInitialized = false;

  private doomWasVisible = false;

  private doomAudioAlreadyPlayed = false;

  private hasObservedActiveBattle = false;

  private doomEndingAudioAlreadyPlayed = false;

  private abandonRequestedInThisSession = false;

  private currentDoomAudio: HTMLAudioElement | null = null;

  private pendingDoomAudioUrl: string | null = null;

  constructor(
    public readonly battle: FinalBattleService,
    public readonly i18n: I18nService,
    public readonly artwork: HeroArtworkResolverService,
  ) {}

  // Localized display labels.
  // Provide localized labels for the battle interface.
  get copy() {
    return {
      title: this.i18n.t('r9.title'),
      refresh: this.i18n.t('r9.refresh'),
      loading: this.i18n.text('Loading battle…', 'Cargando batalla…'),
      refreshing: this.i18n.text('Refreshing battle…', 'Actualizando batalla…'),
      submitting: this.i18n.t('r9.executing'),
      loadError: this.i18n.text('Could not load the battle', 'No se pudo cargar la batalla'),
      operationError: this.i18n.text('Battle operation failed', 'Falló la operación de batalla'),
      retry: this.i18n.text('Retry', 'Reintentar'),
      unavailable: this.i18n.t('r9.noBattleCopy'),
      simulate: this.i18n.text('Simulate battles', 'Simular batallas'),
      result: this.i18n.t('r9.result'),
      start: this.i18n.t('r9.start'),
      strategy: this.i18n.t('r11.strategy'),
      synergy: this.i18n.text('Synergy', 'Sinergia'),
      teamActions: this.i18n.text('Team actions remaining', 'Acciones de equipo restantes'),
      leaderUses: this.i18n.text('Leader uses remaining', 'Usos del líder restantes'),
      strategyChanges: this.i18n.text('Strategy changes remaining', 'Cambios de estrategia restantes'),
      returnTurn: this.i18n.text('Returns on turn', 'Regresa en el turno'),
      selectedHero: this.i18n.text('Selected hero', 'Héroe seleccionado'),
      abandon: this.i18n.text('Abandon battle', 'Abandonar batalla'),
      abandonConfirmation: this.i18n.text('Abandon this battle?', '¿Abandonar esta batalla?'),
      noCategoryActions: this.i18n.text(
        'No actions are available in this category for the current selection.',
        'No hay acciones disponibles en esta categoría para la selección actual.',
      ),
      cost: this.i18n.text('Cost', 'Costo'),
      noItems: this.i18n.t('r9.noInventory'),
      execute: this.i18n.text('EXECUTE ACTION', 'EJECUTAR ACCIÓN'),
      narrative: this.i18n.t('r9.liveNarrative'),
      turn: this.i18n.t('r9.turn'),
      noEvents: this.i18n.text('No events yet', 'Todavía no hay eventos'),
      energy: this.i18n.t('r11.energy'),
      threat: this.i18n.text('Threat', 'Amenaza'),
      inCombat: this.i18n.t('r9.inCombat'),
      reserve: this.i18n.t('r9.reserve'),
      otherStates: this.i18n.text('Other published states', 'Otros estados publicados'),

      completionReason: this.i18n.text('Reason for completion', 'Motivo de finalización'),
      ending: this.i18n.text('Ending', 'Desenlace'),
      outcomeUnavailable: this.i18n.text('Result unavailable', 'Resultado no disponible'),
      reasonUnavailable: this.i18n.text(
        'No completion reason is available.',
        'No hay un motivo de finalización disponible.',
      ),
      endingUnavailable: this.i18n.text('Ending unavailable', 'Desenlace no disponible'),

      statusLabels: {
        READY: this.i18n.t('r10.state.ready'),
        ACTIVE: this.i18n.t('r10.state.active'),
        COMPLETED: this.i18n.t('r10.state.completed'),
        FINISHED: this.i18n.t('r10.state.completed'),
      } as LabelMap,
      unknownStatus: this.i18n.text('Unknown status', 'Estado desconocido'),

      phaseLabels: {
        TOURNAMENT_FINAL: this.i18n.t('r10.phase.tournamentFinal'),
        DOOMSDAY: this.i18n.t('r10.phase.doomsday'),
      } as LabelMap,
      unknownPhase: this.i18n.text('Unknown phase', 'Fase desconocida'),

      threatLabels: {
        LOW: this.i18n.text('Low', 'Baja'),
        MEDIUM: this.i18n.text('Medium', 'Media'),
        HIGH: this.i18n.text('High', 'Alta'),
        CRITICAL: this.i18n.text('Critical', 'Crítica'),
      } as LabelMap,
      unknownThreat: this.i18n.text('Unknown threat level', 'Nivel de amenaza desconocido'),

      outcomeLabels: {
        VICTORY: this.i18n.t('r13.outcomeVictory'),
        DEFEAT: this.i18n.t('r13.outcomeDefeat'),
        ABANDON: this.i18n.t('r13.outcomeAbandon'),
      } as LabelMap,

      endingLabels: {
        NORMAL_VICTORY: this.i18n.text('Victory ending', 'Desenlace de victoria'),
        NORMAL_DEFEAT: this.i18n.text('Defeat ending', 'Desenlace de derrota'),
        EARLY_DEFEAT: this.i18n.text('Early defeat', 'Derrota anticipada'),
        SUE_STORM_SECRET: this.i18n.text(
          'Sue Storm secret ending',
          'Desenlace secreto de Sue Storm',
        ),
        PRE_REVEAL_ABANDON: this.i18n.text(
          'Abandoned before the revelation',
          'Abandono antes de la revelación',
        ),
        POST_REVEAL_ABANDON: this.i18n.text(
          'Abandoned after the revelation',
          'Abandono después de la revelación',
        ),
      } as LabelMap,

      reasonLabels: {
        DOOM_DEFEATED: this.i18n.text(
          'Doctor Doom was defeated.',
          'Doctor Doom fue derrotado.',
        ),
        SUE_STORM_APPEAL: this.i18n.text(
          'The battle ended through the appeal to Sue Storm.',
          'La batalla terminó mediante la apelación a Sue Storm.',
        ),
        FINAL_RESPONSE_SUCCEEDED: this.i18n.text(
          'The final response against Doom succeeded.',
          'La batalla contra Doctor Doom terminó a tu favor.',
        ),
        FINAL_RESPONSE_FAILED: this.i18n.text(
          'The final response against Doom failed.',
          'El enfrentamiento final contra Doctor Doom no tuvo éxito.',
        ),
        PLAYER_NO_LEGAL_PROGRESS: this.i18n.text(
          'Your team could no longer progress through available actions.',
          'Tu equipo ya no podía avanzar mediante las acciones disponibles.',
        ),
        PLAYER_ABANDONED: this.i18n.text(
          'You abandoned the battle.',
          'Abandonaste la batalla.',
        ),
      } as LabelMap,
    };
  }

  get visibleActionGroups(): BattleActionGroup[] {
    return this.battle.groups.filter(({ options }) => {
      const action = options[0];
      if (!action) {
        return false;
      }
      const code = action.actionCode;
      const side = action.target?.sideCode;

      switch (this.commandCategory) {
        case 'inventory':
          return code === 'POWER_UP';
        case 'strategy':
          if (this.strategyMode === 'change') {
            return code === 'CHANGE_STRATEGY';
          }
          if (this.strategyMode === 'swap') {
            return code === 'SWAP';
          }
          return false;
        case 'support':
          return code !== 'POWER_UP' && code !== 'CHANGE_STRATEGY' && code !== 'SWAP' &&
            (code === 'SUPPORT_SPECIAL' || side === 'PLAYER');
        case 'attack':
          return code !== 'POWER_UP' && code !== 'CHANGE_STRATEGY' && code !== 'SWAP' &&
            code !== 'SUPPORT_SPECIAL' && (side === 'OPPONENT' || side === 'DOOM' || side === undefined);
      }
    });
  }

  get isBattleFinished(): boolean {
    const state = this.battle.data?.state;

    return (
      !!state &&
      (
        (state.completion !== null && state.completion !== undefined) ||
        state.status === 'COMPLETED' ||
        state.status === 'FINISHED'
      )
    );
  }

  get showEndingDetail(): boolean {
    const code = this.battle.data?.state?.completion?.endingCode;
    return !!code && !['NORMAL_VICTORY', 'NORMAL_DEFEAT'].includes(code);
  }

  displayStrategy(strategyCode: string, publishedLabel: string): string {
    const labels: Record<string, string> = {
      AGGRESSIVE: this.i18n.text('Aggressive', 'Agresiva'),
      DEFENSIVE: this.i18n.text('Saving', 'Ahorrar'),
      SAVING: this.i18n.text('Saving', 'Ahorrar'),
      PRAGMATIC: this.i18n.text('Saving', 'Ahorrar'),
      BALANCED: this.i18n.text('Balanced', 'Equilibrada'),
    };
    return labels[strategyCode] ?? publishedLabel;
  }

  strategyStyle(strategyCode: string): string {
    return `strategy-${strategyCode.toLowerCase()}`;
  }

  synergyLabel(synergyCode: string): string {
    const labels: Record<string, string> = {
      LOW: this.i18n.text('Low', 'Baja'),
      MEDIUM: this.i18n.text('Medium', 'Media'),
      HIGH: this.i18n.text('High', 'Alta'),
    };
    return labels[synergyCode] ?? this.readableName(synergyCode);
  }

  knownPhase(phaseCode: string): boolean {
    return ['TOURNAMENT_FINAL', 'DOOMSDAY'].includes(phaseCode);
  }

  isDoomChosen(doomId: string): boolean {
    return !!this.battle.selectedActionId && !!this.battle.selectedActionGroup?.options.some(
      action => action.actionId === this.battle.selectedActionId &&
        action.target?.sideCode === 'DOOM' && action.target.targetId === doomId,
    );
  }

  inventoryGroup(itemId: string): BattleActionGroup | null {
    return this.visibleActionGroups.find(group =>
      group.options.length > 0 &&
      group.options[0].actionCode === 'POWER_UP' &&
      group.options[0].itemId === itemId,
    ) ?? null;
  }

  get uncataloguedInventoryGroups(): BattleActionGroup[] {
    if (this.commandCategory !== 'inventory') {
      return [];
    }
    return this.visibleActionGroups.filter(group =>
      group.options.length > 0 && !group.options[0].itemId,
    );
  }

  get outcomeLabel(): string {
    const code = this.battle.data?.state?.completion?.outcomeCode;
    const copy = this.copy;

    return code
      ? copy.outcomeLabels[code] ?? copy.outcomeUnavailable
      : copy.outcomeUnavailable;
  }

  get endingLabel(): string {
    const code = this.battle.data?.state?.completion?.endingCode;
    const copy = this.copy;

    return code
      ? copy.endingLabels[code] ?? copy.endingUnavailable
      : copy.endingUnavailable;
  }

  get completionReasonLabel(): string {
    const code = this.battle.data?.state?.completion?.terminalReasonCode;
    const copy = this.copy;

    return code
      ? copy.reasonLabels[code] ?? copy.reasonUnavailable
      : copy.reasonUnavailable;
  }

  battleStatusLabel(status: string): string {
    const copy = this.copy;
    return copy.statusLabels[status] ?? copy.unknownStatus;
  }

  battlePhaseLabel(phase: string): string {
    const copy = this.copy;
    return copy.phaseLabels[phase] ?? copy.unknownPhase;
  }

  threatLevelLabel(level: string): string {
    const copy = this.copy;
    return copy.threatLabels[level] ?? copy.unknownThreat;
  }

  // Component lifecycle.
  // Load the battle when entering the screen.
  ngOnInit(): void {
    this.confirmingAbandon = false;
    this.doomVisibilityInitialized = false;
    this.doomWasVisible = false;
    this.doomAudioAlreadyPlayed = false;
    this.hasObservedActiveBattle = false;
    this.doomEndingAudioAlreadyPlayed = false;
    this.abandonRequestedInThisSession = false;
    this.pendingDoomAudioUrl = null;
    this.battle.initialize();
  }

  ngDoCheck(): void {
    if (this.battle.status !== 'ready' || !this.battle.data) {
      return;
    }

    const state = this.battle.data.state;
    if (state?.status === 'ACTIVE') {
      this.hasObservedActiveBattle = true;
    }

    const outcome = state?.completion?.outcomeCode;
    if (this.hasObservedActiveBattle && !this.doomEndingAudioAlreadyPlayed) {
      if (outcome === 'VICTORY') {
        this.doomEndingAudioAlreadyPlayed = true;
        this.playDoomAudio(this.doomDefeatedAudioUrl);
      } else if (outcome === 'DEFEAT') {
        this.doomEndingAudioAlreadyPlayed = true;
        this.playDoomAudio(this.doomWinAudioUrl);
      } else if (outcome === 'ABANDON' && this.abandonRequestedInThisSession) {
        this.doomEndingAudioAlreadyPlayed = true;
        this.playDoomAudio(this.doomByeAudioUrl);
      }
    }

    const doomIsVisible = !!this.battle.data.special;
    if (!this.doomVisibilityInitialized) {
      this.doomVisibilityInitialized = true;
      this.doomWasVisible = doomIsVisible;
      return;
    }

    if (!this.doomWasVisible && doomIsVisible && !this.doomAudioAlreadyPlayed) {
      this.doomAudioAlreadyPlayed = true;
      if (!this.doomEndingAudioAlreadyPlayed) {
        this.playDoomAudio(this.doomRevealAudioUrl);
      }
    }
    this.doomWasVisible = doomIsVisible;
  }

  // Audio playback.
  private playDoomAudio(audioUrl: string): void {
    if (typeof Audio === 'undefined') {
      return;
    }

    this.currentDoomAudio?.pause();
    this.pendingDoomAudioUrl = null;
    const clip = new Audio(audioUrl);
    clip.preload = 'auto';
    clip.volume = 0.9;
    this.currentDoomAudio = clip;

    clip.addEventListener('error', () => {
      console.warn('[R9] No se pudo cargar el audio de Doom:', audioUrl, clip.error);
      if (this.currentDoomAudio === clip) {
        this.pendingDoomAudioUrl = null;
      }
    }, { once: true });

    void clip.play().then(() => {
      if (this.currentDoomAudio === clip) {
        this.pendingDoomAudioUrl = null;
      }
    }).catch((error: unknown) => {
      console.warn('[R9] No se pudo reproducir el audio de Doom:', audioUrl, error);
      if (this.currentDoomAudio === clip &&
          error instanceof DOMException && error.name === 'NotAllowedError') {
        this.pendingDoomAudioUrl = audioUrl;
      }
    });
  }

  @HostListener('document:pointerdown')
  retryPendingDoomAudio(): void {
    if (!this.pendingDoomAudioUrl || !this.currentDoomAudio) {
      return;
    }

    const audioUrl = this.pendingDoomAudioUrl;
    const clip = this.currentDoomAudio;
    this.pendingDoomAudioUrl = null;
    void clip.play().catch((error: unknown) => {
      console.warn('[R9] Falló el reintento del audio de Doom:', audioUrl, error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        this.pendingDoomAudioUrl = audioUrl;
      }
    });
  }

  private playExecuteSound(): void {
    if (typeof Audio === 'undefined') {
      return;
    }

    try {
      if (!this.executeAudio) {
        this.executeAudio = new Audio(this.executeAudioUrl);
        this.executeAudio.preload = 'auto';
        this.executeAudio.volume = 0.34;
        this.executeAudio.addEventListener('error', () => {
          console.warn('[R9] No se pudo cargar el efecto de Ejecutar:', this.executeAudioUrl);
        });
      }

      this.executeAudio.pause();
      this.executeAudio.currentTime = 0;
      void this.executeAudio.play().catch((error: unknown) => {
        console.warn('[R9] No se pudo reproducir el efecto de Ejecutar:', error);
      });
    } catch (error) {
      console.warn('[R9] No se pudo preparar el efecto de Ejecutar:', error);
    }
  }

  // Cancel subscriptions when leaving the screen.
  ngOnDestroy(): void {
    this.executeAudio?.pause();
    this.executeAudio = null;
    this.currentDoomAudio?.pause();
    this.currentDoomAudio = null;
    this.pendingDoomAudioUrl = null;
    this.battle.dispose();
  }

  // Switch between action categories.
  selectCommandCategory(category: CommandCategory): void {
    if (this.battle.busy || this.battle.status !== 'ready') {
      return;
    }

    this.onTab(category === 'inventory' ? 'inventory' : 'abilities');
    this.commandCategory = category;
    this.strategyMode = 'choose';
    this.confirmingAbandon = false;
  }

  selectStrategyMode(mode: 'choose' | 'change' | 'swap'): void {
    if (this.battle.busy || this.battle.status !== 'ready') {
      return;
    }
    this.strategyMode = mode;
    this.battle.clearActionSelection();
  }

  actionTitle(group: BattleActionGroup): string {
    const action = group.options[0];
    if (!action) {
      return group.label;
    }
    if (action.actionCode === 'POWER_UP' && action.itemId) {
      const item = this.battle.data?.inventory.find(entry => entry.itemId === action.itemId);
      return item ? `${item.name} (×${item.quantity})` : group.label;
    }
    if (action.actionCode === 'CHANGE_STRATEGY' && action.strategyCode) {
      const strategyName = this.displayStrategy(action.strategyCode, '');
      if (strategyName) {
        return this.i18n.text('Change strategy to', 'Cambiar estrategia a') + ' ' + strategyName;
      }
      return this.i18n.text('Change strategy', 'Cambiar estrategia');
    }
    if (action.actionCode === 'SWAP' && action.formationLabel) {
      return action.formationLabel;
    }
    return group.label;
  }

  readableTeamTarget(sideCode: string, fallback: string): string {
    if (sideCode === 'OPPONENT') {
      return this.i18n.text('Opponent team', 'Equipo rival');
    }
    if (sideCode === 'PLAYER') {
      return this.i18n.text('Your entire team', 'Todo tu equipo');
    }
    return fallback || this.readableName(sideCode);
  }

  readableTargetLabel(publishedLabel: string, sideCode: string): string {
    const code = publishedLabel.trim().toUpperCase();
    if (code === 'OPPONENT' || code === 'OPPONENT_TEAM' || code === 'RIVAL') {
      return this.i18n.text('Opponent team', 'Equipo rival');
    }
    if (code === 'PLAYER' || code === 'PLAYER_TEAM' || code === 'ALLY') {
      return this.i18n.text('Your entire team', 'Todo tu equipo');
    }
    return publishedLabel || this.readableTeamTarget(sideCode, publishedLabel);
  }

  teamTargetOption(sideCode: 'PLAYER' | 'OPPONENT'): BattleAction | null {
    const actions = this.battle.selectedActionGroup?.options ?? [];
    if (this.isBattleFinished) {
      return null;
    }
    return actions.find(action =>
      action.target?.targetType === 'TEAM' && action.target.sideCode === sideCode,
    ) ?? null;
  }

  isTeamTargetChosen(sideCode: 'PLAYER' | 'OPPONENT'): boolean {
    return !!this.battle.selectedActionId && !!this.battle.selectedActionGroup?.options.some(action =>
      action.actionId === this.battle.selectedActionId &&
      action.target?.targetType === 'TEAM' && action.target.sideCode === sideCode,
    );
  }

  hasOtherTargetOptions(group: BattleActionGroup): boolean {
    return group.options.some(action =>
      action.target !== null &&
      !['TEAM', 'HERO', 'ANTAGONIST'].includes(action.target.targetType),
    );
  }

  isHeroTargetChosen(sideCode: string, heroId: string): boolean {
    return !!this.battle.selectedActionId && !!this.battle.selectedActionGroup?.options.some(
      action => action.actionId === this.battle.selectedActionId &&
        action.target?.sideCode === sideCode && action.target.targetType === 'HERO' &&
        action.target.targetId === heroId,
    );
  }

  actionDescription(group: BattleActionGroup): string {
    const action = group.options[0];
    if (action?.actionCode === 'CHANGE_STRATEGY' && action.strategyCode) {
      return this.i18n.text('Choose strategy', 'Elegí la estrategia') + ': ' +
        this.displayStrategy(action.strategyCode, group.label);
    }
    if (action?.actionCode === 'POWER_UP' && action.itemId) {
      const item = this.battle.data?.inventory.find(entry => entry.itemId === action.itemId);
      return item?.description || group.description;
    }
    return group.description;
  }

  get latestEvents(): BattleEvent[] {
    return [...(this.battle.data?.events ?? [])].sort((first, second) => second.sequence - first.sequence);
  }

  heroConditionLabel(condition: string): string {
    const names: Record<string, string> = {
      AVAILABLE: this.i18n.text('Available', 'Disponible'),
      KNOCKED_OUT: this.i18n.text('Knocked out', 'Fuera de combate'),
      INJURED: this.i18n.text('Injured', 'Herido'),
      RECOVERING: this.i18n.text('Recovering', 'Recuperándose'),
    };
    return names[condition] ?? this.readableName(condition);
  }

  readableName(identifier: string): string {
    if (identifier === 'doctor-doom') {
      return 'Doctor Doom';
    }
    if (identifier === 'silver-surfer') {
      return 'Silver Surfer';
    }
    return identifier.replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  }

  showReturnTurn(hero: BattleHero): boolean {
    return hero.returnAtTurn > (this.battle.data?.state?.normalTurn ?? 0) &&
      hero.condition !== 'KNOCKED_OUT';
  }

  onClearAction(): void {
    this.battle.clearActionSelection();
  }

  // Refresh the battle if the screen is not busy.
  onRefresh(): void {
    if (!this.battle.busy) {
      this.battle.refresh();
    }
  }

  // Player controls.
  // Select the player's hero.
  onHero(heroId: string): void {
    this.battle.selectHero(heroId);
  }

  // Switch between abilities and inventory.
  onTab(tab: 'abilities' | 'inventory'): void {
    this.battle.selectTab(tab);
  }

  // Select an action group.
  onGroup(group: BattleActionGroup): void {
    this.battle.selectActionGroup(group);
  }

  // Select a specific action option.
  onTarget(actionId: string): void {
    this.battle.selectActionOption(actionId);
  }

  // Execute the selected battle action.
  onExecute(): void {
    if (!this.battle.canExecute) {
      return;
    }
    if (!this.battle.data?.canStart && this.battle.selectedActionId) {
      this.playExecuteSound();
    }
    this.battle.execute();
  }

  // Ask for confirmation before abandoning the battle.
  onAbandon(): void {
    if (!this.battle.busy && this.battle.data?.canAbandon) {
      this.confirmingAbandon = true;
    }
  }

  cancelAbandon(): void {
    this.confirmingAbandon = false;
  }

  confirmAbandon(): void {
    if (!this.confirmingAbandon || this.battle.busy) {
      return;
    }
    this.confirmingAbandon = false;
    this.abandonRequestedInThisSession = true;
    this.battle.abandon();
  }

  // Separate heroes by their published formation status.
  formationGroups(team: BattleTeam) {
    const copy = this.copy;

    if (team.heroes.length > 0 && team.heroes.every(hero => hero.condition === 'KNOCKED_OUT')) {
      return [{
        code: 'DEFEATED',
        label: this.i18n.text('ALL HEROES KNOCKED OUT', 'TODOS FUERA DE COMBATE'),
        heroes: team.heroes,
      }];
    }

    return [
      {
        code: 'ACTIVE',
        label: copy.inCombat,
        heroes: team.heroes.filter(hero => hero.status === 'ACTIVE'),
      },
      {
        code: 'INACTIVE',
        label: copy.reserve,
        heroes: team.heroes.filter(hero => hero.status === 'INACTIVE'),
      },
      {
        code: 'OTHER',
        label: copy.otherStates,
        heroes: team.heroes.filter(hero => !['ACTIVE', 'INACTIVE'].includes(hero.status)),
      },
    ].filter(group => group.heroes.length > 0);
  }

  // Find a hero's name in either team.
  heroName(heroId: string | null): string {
    for (const team of [this.battle.data?.player, this.battle.data?.opponent]) {
      const hero = team?.heroes.find((hero) => hero.heroId === heroId);

      if (hero) {
        return hero.name;
      }
    }

    return heroId ? this.readableName(heroId) : '-';
  }

  // Expose the published mechanical facts without recalculating combat results.
  eventValues(event: BattleEvent): string {
    return JSON.stringify(event.values, null, 2);
  }

  // Preserve formation elements when Angular checks the view between pointerdown and click.
  trackFormation(_index: number, formation: { code: string }): string {
    return formation.code;
  }

  // Help Angular recognize items when lists are updated.
  trackHero(_index: number, hero: BattleHero): string {
    return hero.heroId;
  }

  trackEvent(_index: number, event: BattleEvent): number {
    return event.sequence;
  }

  trackGroup(_index: number, group: BattleActionGroup): string {
    return group.key;
  }
}