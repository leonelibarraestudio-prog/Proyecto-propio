export interface FinalStageStateApi {
    variant: string;
    status: string;
    phase: string;
    phaseLabel: string;
    normalTurn: number;
    turnState: string;
    attemptId: string;
    participants: {
        playerTeamId: string;
        opponentTeamId: string;
};
    completion: {
        outcomeCode: string;
        terminalReasonCode: string;
        endingEventSequences: number[];
    } | null;
}