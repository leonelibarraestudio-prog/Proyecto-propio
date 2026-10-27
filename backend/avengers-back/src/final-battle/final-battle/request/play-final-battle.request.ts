import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class PlayFinalBattleRequest {
  // Define and validate the allowed battle actions received from Angular.
  @ApiProperty({ enum: ['START', 'CHOOSE_ACTION', 'ABANDON'] })
  @IsIn(['START', 'CHOOSE_ACTION', 'ABANDON'])
  type!: 'START' | 'CHOOSE_ACTION' | 'ABANDON';

  // Require a valid actionId when choosing a battle action.
  @ApiPropertyOptional({ description: 'Exact actionId from the latest legal list.' })
  @ValidateIf(
    (request: PlayFinalBattleRequest) =>
      request.type === 'CHOOSE_ACTION' || request.actionId !== undefined,
  )
  @IsString()
  @IsNotEmpty()
  actionId?: string;
}
