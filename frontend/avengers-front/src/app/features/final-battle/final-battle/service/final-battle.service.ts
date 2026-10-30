import { Injectable } from '@angular/core';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { AppContextService } from '../../../../core/services/app-context.service';
import { FinalStageService } from '../../service/final-stage.service';
import { toApiError } from '../../../../core/models/api-error.interface';
import { BattleAction, BattleCommand, FinalBattleModel } from '../model/final-battle-api.interface';

export interface BattleActionGroup {
  key: string;
  label: string;
  description: string;
  options: BattleAction[];
}

@Injectable({ providedIn: 'root' })
export class FinalBattleService {
  // API and selection state.
  status: 'loading' | 'ready' | 'error' = 'loading';

  data: FinalBattleModel | null = null;

  loadError: string | null = null;

  operationError: string | null = null;

  refreshing = false;

  submitting = false;

  selectedHeroId: string | null = null;

  selectedActionGroup: BattleActionGroup | null = null;

  selectedActionId: string | null = null;

  tab: 'abilities' | 'inventory' = 'abilities';

  groups: BattleActionGroup[] = [];

  private readRequest?: Subscription;

  private playRequest?: Subscription;

  // Use the shared service to communicate with the backend.
  constructor(
    private readonly finalStage: FinalStageService,
    private readonly appContextService: AppContextService,
  ) {}

  // Reset the screen and load the current battle.
  initialize(): void {
    this.dispose();
    this.data = null;
    this.status = 'loading';
    this.operationError = null;
    this.selectedHeroId = null;
    this.tab = 'abilities';
    this.submitting = false;
    this.refresh();
  }

  // Check if the screen is loading or sending a command.
  get busy(): boolean {
    return this.refreshing || this.submitting;
  }

  // Check if the player can execute the selected action.
  get canExecute(): boolean {
    if (this.busy || this.status !== 'ready') {
      return false;
    }

    if (this.data?.canStart) {
      return true;
    }

    const legalAction = this.data?.actions.find(
      action => action.actionId === this.selectedActionId,
    );
    if (this.data?.state?.status !== 'ACTIVE' || !legalAction) {
      return false;
    }
    // The API owns legality, including actions involving reserve heroes.
    return true;
  }

  // Reload the current battle data from the backend.
  refresh(): void {
    if (this.submitting) {
      return;
    }

    // Cancel stale reads and clear selections before accepting new legal actions.
    this.readRequest?.unsubscribe();
    this.refreshing = true;
    this.loadError = null;
    this.clearSelection();
    this.groups = [];

    this.readRequest = forkJoin({
      battle: this.finalStage.getBattle(),
      context: this.appContextService.reload(),
    }).subscribe({
      next: ({ battle: data }) => {
        this.data = data;
        this.status = 'ready';
        this.refreshing = false;

        if (!data.player?.heroes.some((hero) => hero.heroId === this.selectedHeroId)) {
          this.selectedHeroId = data.player?.heroes.find(
            hero => hero.status === 'ACTIVE' && hero.condition === 'AVAILABLE',
          )?.heroId ?? data.player?.heroes.find(
            hero => hero.status === 'ACTIVE',
          )?.heroId ?? null;
        }

        this.buildGroups();
      },
      error: (error) => {
        this.loadError = toApiError(error).message;
        this.status = 'error';
        this.refreshing = false;
      },
    });
  }

  // Player selection.
  // Select a hero from the player's team.
  selectHero(heroId: string): void {
    if (this.submitting || this.status !== 'ready') {
      return;
    }

    if (!this.data?.player?.heroes.some((hero) => hero.heroId === heroId)) {
      return;
    }

    this.selectedHeroId = heroId;
    this.clearSelection();
    this.buildGroups();
  }

  // Switch between abilities and inventory.
  selectTab(tab: 'abilities' | 'inventory'): void {
    if (this.busy || this.status !== 'ready') {
      return;
    }

    this.tab = tab;
    this.clearSelection();
    this.buildGroups();
  }

  // Select a group of related actions.
  selectActionGroup(group: BattleActionGroup): void {
    if (this.busy || this.status !== 'ready' || !this.groups.includes(group)) {
      return;
    }

    this.selectedActionGroup = group;
    this.selectedActionId = null;

    if (group.options.length === 1 &&
        group.options[0].target?.targetType !== 'ANTAGONIST') {
      this.selectedActionId = group.options[0].actionId;
    }
  }

  // Select a specific option from the chosen group.
  selectActionOption(actionId: string): void {
    if (this.busy || this.status !== 'ready') {
      return;
    }

    if (this.selectedActionGroup?.options.some((action) => action.actionId === actionId)) {
      this.selectedActionId = actionId;
    }
  }

  clearActionSelection(): void {
    if (!this.busy) {
      this.clearSelection();
    }
  }

  // Check if a target is available for the selected action group.
  isTarget(sideCode: string, targetType: string, targetId: string): boolean {
    if (this.busy || this.status !== 'ready') {
      return false;
    }

    return !!this.selectedActionGroup?.options.some(
      (action) =>
        action.target?.sideCode === sideCode &&
        action.target.targetType === targetType &&
        action.target.targetId === targetId,
    );
  }

  // Start the battle or execute the selected action.
  execute(): void {
    if (!this.canExecute) {
      return;
    }

    if (this.data?.canStart) {
      this.send({ type: 'START' });
    } else if (this.selectedActionId) {
      this.send({ type: 'CHOOSE_ACTION', actionId: this.selectedActionId });
    }
  }

  // Abandon the battle if allowed.
  abandon(): void {
    if (this.busy || this.status !== 'ready' || !this.data?.canAbandon) {
      return;
    }

    this.send({ type: 'ABANDON' });
  }

  // Cancel active subscriptions when leaving the screen.
  dispose(): void {
    this.readRequest?.unsubscribe();
    this.playRequest?.unsubscribe();
  }

  // Send a battle command and reload the current state.
  private send(command: BattleCommand): void {
    this.submitting = true;
    this.operationError = null;
    this.clearSelection();

    this.playRequest = this.finalStage
      .play(command)
      .pipe(
        finalize(() => {
          this.submitting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.submitting = false;
          this.refresh();
        },
        error: (error) => {
          this.operationError = toApiError(error).message;
          this.submitting = false;

          // Reload after an error without repeating a potentially applied command.
          this.refresh();
        },
      });
  }

  // Clear the selected action group and option.
  private clearSelection(): void {
    this.selectedActionGroup = null;
    this.selectedActionId = null;
  }

  // Legal actions returned by the API.
  // Group legal actions by hero and tab to display similar options together.
  private buildGroups(): void {
    const groups: BattleActionGroup[] = [];
    const groupsByKey = new Map<string, BattleActionGroup>();

    for (const action of this.data?.actions ?? []) {
      const inventoryAction = action.actionCode === 'POWER_UP';

      if ((this.tab === 'inventory') !== inventoryAction) {
        continue;
      }

      if (action.actionCode === 'SWAP') {
        if (
          this.selectedHeroId &&
          action.outgoingHeroId !== this.selectedHeroId &&
          action.incomingHeroId !== this.selectedHeroId
        ) {
          continue;
        }
      } else if (action.actorHeroId && action.actorHeroId !== this.selectedHeroId) {
        continue;
      }

      // Group equivalent legal choices while retaining each opaque target actionId.
      const key = JSON.stringify([
        action.actionCode,
        action.actorHeroId,
        action.abilityId,
        action.itemId,
        action.strategyCode,
        action.roleCombination,
        action.outgoingHeroId,
        action.incomingHeroId,
        action.label,
        action.description,
        action.cost.abilityPoints,
      ]);

      let group = groupsByKey.get(key);

      if (!group) {
        group = {
          key,
          label: action.label,
          description: action.description,
          options: [],
        };
        groups.push(group);
        groupsByKey.set(key, group);
      }

      group.options.push(action);
    }

    this.groups = groups;
  }
}
